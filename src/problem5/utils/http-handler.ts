import { Request, Response, NextFunction } from 'express';
import { HttpStatus } from '../constants/http';

export function wrap(handler: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res, next);
    } catch (err) {
      console.error('Unhandled error in handler:', err);
      res.status(HttpStatus.InternalServerError).json({ error: 'Internal Server Error' });
    }
  };
}
