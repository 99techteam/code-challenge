import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import resourceRoutes from './routes/resourceRoutes';
import { validateCreateResource, validateUpdateResource, validateQueryResource, validateResourceId, errorHandler, notFoundHandler } from './middleware/validation';
import { initializeTypeORM, closeTypeORM } from './database/typeorm.config';
import { ResourceService } from './services/resource.service';
import { swaggerSpec } from './swagger/swagger.config';
import { logInfo, logError, logHttp, logApi } from './utils/logger';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS?.split(',') 
    : '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const userAgent = req.get('User-Agent') || 'Unknown';
  const referer = req.get('Referer') || 'Direct';
  
  logHttp(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent,
    referer,
    contentType: req.get('Content-Type'),
    contentLength: req.get('Content-Length')
  });
  next();
});

// Swagger Documentation
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the current server status and timestamp
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is running successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 *             example:
 *               success: true
 *               message: "Server is running"
 *               timestamp: "2023-12-01T10:00:00.000Z"
 */
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Resource Management API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'list',
    filter: true,
    showExtensions: true,
    tryItOutEnabled: true
  }
}));

// API Routes (validation is now handled in the routes themselves)
app.use('/api/resources', resourceRoutes);

// Root endpoint
/**
 * @swagger
 * /:
 *   get:
 *     summary: API Information
 *     description: Returns basic information about the API and available endpoints
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Resource Management API"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 documentation:
 *                   type: string
 *                   example: "http://localhost:3000/api-docs"
 *                 architecture:
 *                   type: string
 *                   example: "CQRS with Express.js and TypeScript"
 *                 endpoints:
 *                   type: object
 */
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Resource Management API with CQRS Architecture',
    version: '1.0.0',
    documentation: `${req.protocol}://${req.get('host')}/api-docs`,
    architecture: 'CQRS (Command Query Responsibility Segregation)',
    features: [
      'TypeScript with strict typing',
      'Class-validator integration', 
      'MySQL database with connection pooling',
      'Docker containerization',
      'Comprehensive API documentation'
    ],
    endpoints: {
      documentation: 'GET /api-docs',
      health: 'GET /health',
      resources: {
        list: 'GET /api/resources',
        create: 'POST /api/resources',
        getById: 'GET /api/resources/:id',
        update: 'PUT /api/resources/:id',
        partialUpdate: 'PATCH /api/resources/:id',
        delete: 'DELETE /api/resources/:id',
        categories: 'GET /api/resources/categories'
      }
    }
  });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  logInfo('SIGTERM received, shutting down gracefully');
  await closeTypeORM();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logInfo('SIGINT received, shutting down gracefully');
  await closeTypeORM();
  process.exit(0);
});

// Initialize database with TypeORM
const initializeDatabase = async () => {
  try {
    await initializeTypeORM();
    logInfo('🚀 Server is running on port ' + PORT);
    logInfo('📚 Swagger Documentation: http://localhost:' + PORT + '/api-docs');
    logInfo('🏠 API Information: http://localhost:' + PORT);
    logInfo('🔍 Health check: http://localhost:' + PORT + '/health');
    logInfo('🏗️ Architecture: CQRS with TypeORM & Express.js & TypeScript');
  } catch (error) {
    logError('Failed to initialize TypeORM database', error);
    process.exit(1);
  }
};

// Initialize TypeORM first, then start server
const startApplication = async () => {
  try {
    // Initialize database first
    await initializeDatabase();
    
    // Then start the server
    const server = app.listen(PORT, () => {
      // Seed database in development after server is ready
      if (process.env.NODE_ENV !== 'production') {
        setTimeout(async () => {
          try {
            const resourceService = new ResourceService();
            await resourceService.seedData();
          } catch (error: any) {
            logError('Failed to seed database on startup', error);
          }
        }, 1000); 
      }
    });

    // Handle server errors
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      switch (error.code) {
        case 'EACCES':
          logError(`Port ${PORT} requires elevated privileges`, error);
          process.exit(1);
        case 'EADDRINUSE':
          logError(`Port ${PORT} is already in use`, error);
          process.exit(1);
        default:
          throw error;
      }
    });

    return server;
  } catch (error) {
    logError('Failed to start application', error);
    process.exit(1);
  }
};

// Start the application only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  startApplication();
}

// Server error handling is now inside startApplication function

export default app; 