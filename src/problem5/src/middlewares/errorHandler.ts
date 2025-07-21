import { Request, Response, NextFunction } from 'express';
import { ValidationError } from './validation';
import logger from '../lib/logger';

export interface AppError extends Error {
  status?: number;
}

export const errorHandler = (
  err: AppError | ValidationError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errorInfo = {
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    status: err.status || 500,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
  };

  if ('errors' in err) {
    logger.warn(errorInfo, 'Validation Error');
    res.status(err.status || 400).json({
      message: err.message || 'Validation Error',
      errors: err.errors,
    });
    return;
  }
  
  if (err.status && err.status < 500) {
    logger.warn(errorInfo, 'Client Error');
  } else {
    logger.error(errorInfo, 'Server Error');
  }
  
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
};
