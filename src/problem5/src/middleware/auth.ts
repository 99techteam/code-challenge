import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

export const authenticateApiKey = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const apiKey = process.env.API_KEY;

  // Check if API_KEY is configured
  if (!apiKey) {
    logger.error('API_KEY is not configured in environment variables');
    res.status(500).json({
      success: false,
      message: 'Server configuration error',
    });
    return;
  }

  // Get API key from request headers
  const requestApiKey = req.headers['x-api-key'] as string;

  // Check if API key is provided
  if (!requestApiKey) {
    logger.warn('Authentication failed: No API key provided', {
      ip: req.ip,
      path: req.path,
    });
    res.status(401).json({
      success: false,
      message: 'API key is required. Please provide it in the x-api-key header',
    });
    return;
  }

  // Validate API key
  if (requestApiKey !== apiKey) {
    logger.warn('Authentication failed: Invalid API key', {
      ip: req.ip,
      path: req.path,
    });
    res.status(403).json({
      success: false,
      message: 'Invalid API key',
    });
    return;
  }

  // Authentication successful
  logger.debug('Authentication successful', {
    ip: req.ip,
    path: req.path,
  });
  next();
};
