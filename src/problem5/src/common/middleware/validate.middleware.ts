import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { HttpStatus } from '../constants/httpStatus';

type Target = 'body' | 'query' | 'params';

export function validate(schema: ZodSchema, target: Target = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      res.status(HttpStatus.BAD_REQUEST).json({
        error: 'Validation failed',
        details: result.error.flatten().fieldErrors,
      });
      return;
    }
    req[target] = result.data;
    next();
  };
}
