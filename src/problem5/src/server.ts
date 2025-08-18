import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from './config';
import { testSequelizeConnection } from './config/sequelize';
import { createRoutes } from './routes';
import { httpLogger, requestIdMiddleware, logger } from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/error.handler';
import { initializeDatabase } from './scripts/database.init';

const app = express();

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration
app.use(
  cors({
    origin: config.corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Compression middleware
app.use(compression());

// Request parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request ID and logging middleware
app.use(requestIdMiddleware);
app.use(httpLogger);

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// API routes will be added after database initialization
// 404 and error handlers will be added after routes are mounted

// Graceful shutdown handler
const gracefulShutdown = (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  server.close(() => {
    logger.info('HTTP server closed');

    // Close database connections
    import('./config/sequelize').then(({ closeSequelizeConnection }) => {
      closeSequelizeConnection().then(() => {
        logger.info('Database connections closed');
        process.exit(0);
      });
    });
  });

  // Force close after 30 seconds
  setTimeout(() => {
    logger.error(
      'Could not close connections in time, forcefully shutting down'
    );
    process.exit(1);
  }, 30000);
};

// Start server
const startServer = async (): Promise<any> => {
  try {
    // Test Sequelize database connection
    await testSequelizeConnection();

    // Initialize database if needed (for Docker startup)
    await initializeDatabase();

    // Add API routes after database is initialized
    const routes = createRoutes();
    app.use('/api', routes);

    // Add 404 and error handlers after routes are mounted
    app.use(notFoundHandler);
    app.use(errorHandler);

    // Start HTTP server
    const server = app.listen(config.port, () => {
      logger.info(
        {
          environment: config.nodeEnv,
          port: config.port,
          apiUrl: `http://localhost:${config.port}/api`,
          healthCheck: `http://localhost:${config.port}/api/health`,
        },
        '🚀 Server is running!'
      );
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    return server;
  } catch (error) {
    logger.error({ err: error }, 'Failed to start server');
    process.exit(1);
  }
};

// Start the server
let server: any;
startServer().then(s => {
  server = s;
});

export default app;
