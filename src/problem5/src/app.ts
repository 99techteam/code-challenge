import express, { Express } from 'express';
import dotenv from 'dotenv';
import resourceRoutes from './routes/resourceRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import logger from './config/logger';
import requestLogger from './middleware/requestLogger';
import {
  helmetConfig,
  mongoSanitizeMiddleware,
  xssSanitize,
  securityHeaders,
  validateInputSize,
} from './middleware/security';

// Load environment variables
dotenv.config();

const app: Express = express();

// Security Middleware - Applied first for maximum protection
// Helmet.js - Sets various security-related HTTP headers
app.use(helmetConfig);

// Custom security headers
app.use(securityHeaders);

// Body parsing middleware with size limits
app.use(express.json({ limit: '100kb' })); // Limit JSON payload size
app.use(express.urlencoded({ extended: true, limit: '100kb' })); // Limit URL-encoded payload size

// Input sanitization middleware
// Sanitize against NoSQL injection attacks
app.use(mongoSanitizeMiddleware);

// Sanitize against XSS attacks
app.use(xssSanitize);

// Validate input size
app.use(validateInputSize(1024 * 100)); // 100KB max

// Request logging middleware (Winston + Morgan)
app.use(requestLogger);

// Health check endpoint
app.get('/health', (_req, res) => {
  logger.debug('Health check endpoint accessed');
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/resources', resourceRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

export default app;
