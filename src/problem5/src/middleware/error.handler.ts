import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';
import { AppError } from '../errors';

// Async handler wrapper
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 handler
export const notFoundHandler = (_req: Request, res: Response): void => {
  const response: ApiResponse = {
    success: false,
    error: 'Resource not found',
  };
  res.status(404).json(response);
};

// Main error handler
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal server error';

  // Handle AppError instances
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }
  // Handle Sequelize errors
  else if (
    err.message.includes('duplicate key') ||
    err.message.includes('unique constraint')
  ) {
    statusCode = 409;
    message = 'Resource already exists';
  } else if (err.message.includes('foreign key constraint')) {
    statusCode = 400;
    message = 'Invalid reference to related resource';
  }

  // Log errors for debugging
  if (statusCode >= 500) {
    console.error('Error:', {
      message: err.message,
      url: req.url,
      method: req.method,
    });
  }

  const response: ApiResponse = {
    success: false,
    error: message,
    ...(process.env['NODE_ENV'] === 'development' && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
};
