import { Request, Response, NextFunction, RequestHandler } from 'express';
import { randomUUID } from 'crypto';
import { logger } from '../logger';

export const requestContextMiddleware: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
  const requestId = (req.headers['x-request-id'] as string) || randomUUID();
  
  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-ID', requestId);
  
  req.log = logger.child({ requestId });
  
  next();
};
