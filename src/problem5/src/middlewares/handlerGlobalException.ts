import { environment } from '../config';
import { ApiError, ErrorType, InternalError } from '../core/ApiError';
import { NextFunction, Request, Response } from 'express';

export const handleGlobalException = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ApiError) {
    ApiError.handle(err, res);
    if (err.type === ErrorType.INTERNAL)
      console.error(
        `500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`,
      );
  } else {
    console.error(
      `500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`,
    );
    ApiError.handle(new InternalError(), res);
  }
};