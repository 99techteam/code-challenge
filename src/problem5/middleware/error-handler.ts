import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { AppError } from '../model/errors';

export const errorHandler: ErrorRequestHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const log = req.log;
  const requestId = req.headers['x-request-id'] as string;

  if (error instanceof AppError) {
    if (error.statusCode >= 500) {
      log?.error({ err: error, url: req.url, requestId }, 'Server error');
    } else {
      log?.warn({ err: error, url: req.url, requestId }, 'Client error');
    }

    res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        ...(error.details !== undefined && { details: error.details }),
      },
    });
    return;
  }

  log?.error({ err: error, url: req.url, requestId }, 'Unexpected error');
  res.status(500).json({
    error: {
      code: 'internal_server_error',
      message: 'Internal server error',
    },
  });
};
