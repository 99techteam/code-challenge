// DEPENDENCY INJECTION: This file is used in src/index.ts
import { type Response, type NextFunction, type Request } from 'express';

export const responseMiddleware = (_req: Request, res: Response, next: NextFunction) => {
  res.success = (data: any) => {
    res.status(200).json({
      success: true,
      data,
      error: null,
      meta: { timestamp: new Date().toISOString() },
    });
  };

  res.error = (message: string, status: number = 500, data?: any) => {
    res.status(status).json({
      success: false,
      data: data,
      error: message,
      meta: { timestamp: new Date().toISOString() },
    });
  };

  next();
};