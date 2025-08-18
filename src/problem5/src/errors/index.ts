// Export simplified error classes and factory functions
export {
  AppError,
  BaseError,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  validationError,
  databaseError,
  // Legacy exports for backward compatibility
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InternalServerError,
  ValidationError,
  DatabaseError,
} from './BaseError';
