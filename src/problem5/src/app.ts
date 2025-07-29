import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { database } from './database/database';
import bookRoutes from './routes/bookRoutes';
import { openApiDocument } from './openapi/openapi';
import { logger } from './utils/logger';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { ERROR_CODES, ERROR_MESSAGES, HTTP_STATUS } from './constants/errors';
import { getServerConfig, getApiDocsConfig } from './config/env';

extendZodWithOpenApi(z);

const app = express();
const serverConfig = getServerConfig();
const apiDocsConfig = getApiDocsConfig();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(limiter);
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim())
  }
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint (doesn't require database)
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    status: 'healthy'
  });
});

app.use('/api/books', bookRoutes);

if (apiDocsConfig.swaggerUiEnabled) {
  app.use('/api-docs', swaggerUi.serve as any, swaggerUi.setup(openApiDocument) as any);
  logger.info('Swagger UI enabled at /api-docs');
} else {
  logger.info('Swagger UI disabled');
}

if (apiDocsConfig.openapiEnabled) {
  app.get('/openapi.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(openApiDocument);
  });
  logger.info('OpenAPI JSON enabled at /openapi.json');
} else {
  logger.info('OpenAPI JSON disabled');
}

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', error);
  
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: ERROR_MESSAGES[ERROR_CODES.INTERNAL_SERVER_ERROR],
    errorCode: ERROR_CODES.INTERNAL_SERVER_ERROR,
    statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Try to connect to database, but don't fail if it's not available
    try {
      await database.connect();
      logger.info('Database connected successfully');
    } catch (dbError) {
      logger.warn('Database connection failed, running without database:', dbError);
      logger.info('API endpoints will return database connection errors');
    }
    
    app.listen(serverConfig.port, () => {
      logger.info(`Server is running on port ${serverConfig.port}`);
      logger.info(`Health check available at http://localhost:${serverConfig.port}/health`);
      
      if (apiDocsConfig.swaggerUiEnabled) {
        logger.info(`API Documentation available at http://localhost:${serverConfig.port}/api-docs`);
      }
      
      if (apiDocsConfig.openapiEnabled) {
        logger.info(`OpenAPI JSON available at http://localhost:${serverConfig.port}/openapi.json`);
      }
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

export { app, startServer }; 