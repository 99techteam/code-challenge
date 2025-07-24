import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

import { UpdateProductSchema } from '../schemas/zod/product.openapi';

export function validateUpdateProduct(req: Request, res: Response, next: NextFunction) {
  try {
    UpdateProductSchema.parse(req.body);
    return next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Invalid request payload',
        errors: error instanceof z.ZodError ? [error.message] : [],
      });
    }

    // Unknown error (should never happen)
    return res.status(500).json({ message: 'Internal server error' });
  }
}
