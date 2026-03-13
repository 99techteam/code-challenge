import { NextFunction, Request, Response } from 'express'
import { HttpError } from '../errors/HttpError'
import { logger } from '../utils/logger'

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof HttpError) {
    logger.warn({ err, statusCode: err.statusCode }, err.message)
    res.status(err.statusCode).json({ message: err.message })
    return
  }

  logger.error({ err }, 'Unhandled error')
  res.status(500).json({ message: 'Internal server error' })
}
