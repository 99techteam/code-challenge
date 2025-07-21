import { Request, Response, NextFunction } from 'express';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateResourceDto, UpdateResourceDto, QueryResourceDto } from '../dto';
import { logValidation, logError } from '../utils/logger';
import { AppError, ValidationError as CustomValidationError, NotFoundError, isOperationalError, createErrorResponse } from '../utils/errors';

// Generic validation middleware factory
export const validateDto = <T extends object>(dtoClass: new () => T, source: 'body' | 'query' = 'body') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = plainToClass(dtoClass, source === 'body' ? req.body : req.query);
      const errors = await validate(dto);

      if (errors.length > 0) {
        const errorMessages = extractValidationErrors(errors);
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errorMessages
        });
        return;
      }

      // Replace request data with validated and transformed DTO
      if (source === 'body') {
        req.body = dto;
      } else {
        req.query = dto as any;
      }

      next();
    } catch (error) {
      logError('Validation middleware error', error, { 
        source, 
        dtoClass: dtoClass.name,
        requestPath: req.path 
      });
      res.status(500).json({
        success: false,
        error: 'Internal server error during validation'
      });
    }
  };
};

// Extract error messages from validation errors
function extractValidationErrors(errors: ValidationError[]): string[] {
  const messages: string[] = [];

  for (const error of errors) {
    if (error.constraints) {
      messages.push(...Object.values(error.constraints));
    }

    // Handle nested validation errors
    if (error.children && error.children.length > 0) {
      messages.push(...extractValidationErrors(error.children));
    }
  }

  return messages;
}

// Specific validation middlewares using the factory
export const validateCreateResource = validateDto(CreateResourceDto, 'body');
export const validateUpdateResource = validateDto(UpdateResourceDto, 'body');
export const validateQueryResource = validateDto(QueryResourceDto, 'query');

// Middleware to validate resource ID parameter
export const validateResourceId = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const id = parseInt(req.params.id);
  
  if (isNaN(id) || id <= 0) {
    res.status(400).json({
      success: false,
      error: 'Invalid resource ID. ID must be a positive integer.'
    });
    return;
  }

  (req.params as any).id = id.toString();
  next();
};

// Global error handler middleware
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let logLevel: 'error' | 'warn' = 'error';

  // Handle operational errors (AppError instances)
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    // Only log as error if it's a server error (5xx)
    logLevel = statusCode >= 500 ? 'error' : 'warn';
  }

  // Log the error with appropriate level and context
  const logContext = {
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    statusCode,
    errorType: error.constructor.name,
    isOperational: isOperationalError(error)
  };

  if (logLevel === 'error') {
    logError('Unhandled error', error, logContext);
  } else {
    logValidation(`Client error: ${error.message}`, logContext);
  }

  // Create error response
  const errorResponse = createErrorResponse(
    error,
    process.env.NODE_ENV === 'development' && statusCode >= 500
  );

  // Ensure we don't expose internal error details in production for server errors
  if (process.env.NODE_ENV === 'production' && statusCode >= 500 && !(error instanceof AppError)) {
    errorResponse.error = 'Internal server error';
    delete errorResponse.stack;
  }

  res.status(statusCode).json(errorResponse);
};

// 404 handler middleware
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found`
  });
}; 