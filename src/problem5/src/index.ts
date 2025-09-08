import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { initializeDatabase } from './config/data-source';
import { swaggerSpec } from './config/swagger';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { createConfiguredRateLimiter, createProfiledRateLimiter } from './middleware/rateLimitMiddleware';
import { metricsMiddleware, MetricsController } from './controllers/metricsController';
import { scalabilityMonitoringMiddleware } from './controllers/scalabilityController';

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting configuration
const globalRateLimit = createConfiguredRateLimiter();
const authRateLimit = createProfiledRateLimiter('auth');
const writeRateLimit = createProfiledRateLimiter('write');

// Middleware
app.use(helmet()); // Security middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Metrics collection middleware (before rate limiting)
app.use(metricsMiddleware);

// Scalability monitoring middleware
app.use(scalabilityMonitoringMiddleware());

// Apply rate limiting to all API routes
app.use('/api', globalRateLimit);

// Apply stricter rate limiting to write operations
app.use('/api/books', (req, res, next) => {
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    return writeRateLimit(req, res, next);
  }
  next();
});

// Health check endpoint with rate limit info
app.get('/health', MetricsController.healthCheck);

// API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Books API Documentation'
}));

// API routes
app.use('/api', routes);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Initialize database
    await initializeDatabase();
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📚 API documentation available at http://localhost:${PORT}/api-docs`);
      console.log(`🏥 Health check available at http://localhost:${PORT}/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer();

export default app;
