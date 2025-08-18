import pino from 'pino';
import { Request, Response, NextFunction } from 'express';
import pinoHttp from 'pino-http';
import { v4 as uuidv4 } from 'uuid';

// Create a simplified logger
export const logger = pino({
  level: process.env['LOG_LEVEL'] || 'info',
  base: {
    service: 'problem5-api',
  },
});

// Request ID middleware
export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const requestId = (req.headers['x-request-id'] as string) || uuidv4();
  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
};

// Minimal HTTP logging middleware
export const httpLogger = pinoHttp({
  logger,
  genReqId: req => req.headers['x-request-id'] as string,
  autoLogging: {
    ignore: req => req.url === '/api/health',
  },
  customLogLevel: (_req, res) => {
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  serializers: {
    req: req => ({
      method: req.method,
      url: req.url,
    }),
    res: res => ({
      statusCode: res.statusCode,
    }),
  },
});

// Simplified utility functions
export const logError = (message: string, error?: Error) => {
  logger.error({ err: error }, message);
};

export default logger;
