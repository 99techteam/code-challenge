// Custom error classes for better error handling
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    code?: string
  ) {
    super(message);
    
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;

    // Ensure the name of this error is the same as the class name
    this.name = this.constructor.name;

    // This clips the constructor invocation from the stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  public readonly field?: string;
  public readonly value?: any;

  constructor(message: string, field?: string, value?: any) {
    super(message, 400, true, 'VALIDATION_ERROR');
    this.field = field;
    this.value = value;
  }
}

export class NotFoundError extends AppError {
  public readonly resource?: string;
  public readonly resourceId?: string | number;

  constructor(message: string, resource?: string, resourceId?: string | number) {
    super(message, 404, true, 'NOT_FOUND');
    this.resource = resource;
    this.resourceId = resourceId;
  }
}

export class DatabaseError extends AppError {
  public readonly operation?: string;
  public readonly table?: string;

  constructor(message: string, operation?: string, table?: string) {
    super(message, 500, true, 'DATABASE_ERROR');
    this.operation = operation;
    this.table = table;
  }
}

export class CQRSError extends AppError {
  public readonly commandOrQuery?: string;

  constructor(message: string, commandOrQuery?: string) {
    super(message, 500, true, 'CQRS_ERROR');
    this.commandOrQuery = commandOrQuery;
  }
}

// Helper function to determine if an error is operational
export const isOperationalError = (error: Error): boolean => {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
};

// Helper function to create standardized error responses
export const createErrorResponse = (error: AppError | Error, includeStack = false) => {
  const response: any = {
    success: false,
    error: error.message || 'An unexpected error occurred'
  };

  if (error instanceof AppError) {
    response.code = error.code;
    
    // Add specific error details based on error type
    if (error instanceof ValidationError && error.field) {
      response.field = error.field;
      if (error.value !== undefined) {
        response.value = error.value;
      }
    }
    
    if (error instanceof NotFoundError) {
      if (error.resource) response.resource = error.resource;
      if (error.resourceId) response.resourceId = error.resourceId;
    }
    
    if (error instanceof DatabaseError) {
      if (error.operation) response.operation = error.operation;
      if (error.table) response.table = error.table;
    }
    
    if (error instanceof CQRSError && error.commandOrQuery) {
      response.commandOrQuery = error.commandOrQuery;
    }
  }

  if (includeStack && error.stack) {
    response.stack = error.stack;
  }

  return response;
}; 