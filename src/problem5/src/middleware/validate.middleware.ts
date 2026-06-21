// src/middlewares/validate.middleware.ts
import { type Request, type Response, type NextFunction } from 'express';
import { type ZodType } from 'zod';

export const validate = (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    // Extract a readable message from the Zod issues
    const errorMessage = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join(', ');

    // Use your standardized error helper
    return res.error(errorMessage, 400);
  }

  req.body = result.data; 
  next();
};