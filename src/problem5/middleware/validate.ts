import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodSchema } from 'zod';
import { ValidationError } from '../model/errors';

interface ValidationSchema {
  params?: ZodSchema;
  query?: ZodSchema;
  body?: ZodSchema;
}

export const validate = (schema: ValidationSchema): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const errors: { path: (string | number)[]; message: string }[] = [];

    if (schema.params) {
      const result = schema.params.safeParse(req.params);
      if (!result.success) {
        result.error.errors.forEach((e) => errors.push({ path: e.path, message: e.message }));
      } else {
        req.params = result.data;
      }
    }

    if (schema.query) {
      const result = schema.query.safeParse(req.query);
      if (!result.success) {
        result.error.errors.forEach((e) => errors.push({ path: e.path, message: e.message }));
      } else {
        req.query = result.data;
      }
    }

    if (schema.body) {
      const result = schema.body.safeParse(req.body);
      if (!result.success) {
        result.error.errors.forEach((e) => errors.push({ path: e.path, message: e.message }));
      } else {
        req.body = result.data;
      }
    }

    if (errors.length > 0) {
      next(new ValidationError(errors));
      return;
    }

    next();
  };
};
