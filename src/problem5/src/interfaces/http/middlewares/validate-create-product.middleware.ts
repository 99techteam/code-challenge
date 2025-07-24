import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

import { CreateProductSchema } from '../schemas/zod/product.openapi';

export const validateCreateProduct = (req: Request, res: Response, next: NextFunction) => {
  try {
    CreateProductSchema.parse(req.body);
    return next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Invalid product payload',
        errors: error instanceof z.ZodError ? [error.message] : [],
      });
    }

    // Unknown error (should never happen)
    return res.status(500).json({ message: 'Internal server error' });
  }
};
