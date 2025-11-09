import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // Log the error with details
  logger.error(`Error: ${err.message}`, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    stack: err.stack,
    body: req.body,
  });

  if (err.message === 'Resource not found') {
    return res.status(404).json({
      success: false,
      error: 'Resource not found'
    });
  }

  // Don't leak error details in production
  const errorMessage = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  res.status(500).json({
    success: false,
    error: errorMessage,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  logger.warn(`404 Not Found: ${req.method} ${req.url}`, {
    method: req.method,
    url: req.url,
    ip: req.ip,
  });

  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
};
