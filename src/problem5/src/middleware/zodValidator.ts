import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';

/**
 * Generic Zod validation middleware factory
 * Validates different parts of the request (body, params, query)
 */
export const validateRequest = (schema: ZodSchema, source: 'body' | 'params' | 'query' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get the data to validate based on source
      const dataToValidate = req[source];

      // Validate and parse the data
      const validatedData = schema.parse(dataToValidate);

      // Replace the original data with validated/transformed data
      req[source] = validatedData;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod errors into a user-friendly format
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: formattedErrors,
        });
      }

      // Handle unexpected errors
      next(error);
    }
  };
};

/**
 * Middleware to validate request body
 */
export const validateBody = (schema: ZodSchema) => {
  return validateRequest(schema, 'body');
};

/**
 * Middleware to validate request params
 */
export const validateParams = (schema: ZodSchema) => {
  return validateRequest(schema, 'params');
};

/**
 * Middleware to validate request query
 */
export const validateQuery = (schema: ZodSchema) => {
  return validateRequest(schema, 'query');
};

/**
 * Helper to format Zod errors for development/debugging
 */
export const formatZodError = (error: ZodError): string => {
  return error.errors
    .map(err => `${err.path.join('.')}: ${err.message}`)
    .join(', ');
};
