import type { Request, Response, NextFunction } from 'express';
import { validate as isUUID } from 'uuid';

/**
 * Middleware to validate UUID format of product ID in route parameters.
 */
export function validateProductId(req: Request, res: Response, next: NextFunction): void {
  const { id } = req.params;

  if (!isUUID(id)) {
    res.status(400).json({ message: 'Invalid product ID format. Must be a UUID.' });
    return;
  }

  return next();
}
