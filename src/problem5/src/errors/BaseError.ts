/**
 * Simplified application error class
 */
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Factory functions for common error types
 */
export const badRequest = (message: string): AppError =>
  new AppError(message, 400);

export const unauthorized = (message: string): AppError =>
  new AppError(message, 401);

export const forbidden = (message: string): AppError =>
  new AppError(message, 403);

export const notFound = (message: string): AppError =>
  new AppError(message, 404);

export const conflict = (message: string): AppError =>
  new AppError(message, 409);

export const validationError = (message: string): AppError =>
  new AppError(message, 400);

export const databaseError = (
  message: string,
  originalError?: Error
): AppError => {
  const error = new AppError(message, 500);
  if (originalError && process.env['NODE_ENV'] === 'development') {
    error.stack = `${error.stack}\nCaused by: ${originalError.stack}`;
  }
  return error;
};

// Legacy exports for backward compatibility during transition
export const BadRequestError = badRequest;
export const UnauthorizedError = unauthorized;
export const ForbiddenError = forbidden;
export const NotFoundError = notFound;
export const ConflictError = conflict;
export const ValidationError = validationError;
export const DatabaseError = databaseError;
export const InternalServerError = (message: string) =>
  new AppError(message, 500);

// For compatibility with existing code that expects classes
export class BaseError extends AppError {
  constructor(message: string, statusCode: number) {
    super(message, statusCode);
  }
}
