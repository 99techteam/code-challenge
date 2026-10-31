import type { ErrorRequestHandler, RequestHandler } from 'express';
import { AppError } from './app-error.js';

/** JSON 404 response for any path not handled by a route. */
export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ error: 'Not found' });
};

/** Converts expected and Express parser errors into consistent JSON responses. */
export const errorHandler: ErrorRequestHandler = (error, _req, res, next) => {
  if (res.headersSent) return next(error);

  const parserError = error as { type?: string };
  if (parserError.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }
  if (parserError.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body too large' });
  }
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ error: error.message });
  }

  console.error(error);
  return res.status(500).json({ error: 'Internal server error' });
};
