// Error codes for consistent API responses
export const ERROR_CODES = {
  // Validation errors (400)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // Not found errors (404)
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  BOOK_NOT_FOUND: 'BOOK_NOT_FOUND',
  
  // Conflict errors (409)
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
  DUPLICATE_ISBN: 'DUPLICATE_ISBN',
  
  // Server errors (500)
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

// Error messages for consistent API responses
export const ERROR_MESSAGES = {
  [ERROR_CODES.VALIDATION_ERROR]: 'Validation error occurred',
  [ERROR_CODES.INVALID_INPUT]: 'Invalid input data provided',
  [ERROR_CODES.MISSING_REQUIRED_FIELD]: 'Required field is missing',
  [ERROR_CODES.INVALID_FORMAT]: 'Invalid data format',
  
  [ERROR_CODES.RESOURCE_NOT_FOUND]: 'Resource not found',
  [ERROR_CODES.BOOK_NOT_FOUND]: 'Book not found with the provided ID',
  
  [ERROR_CODES.RESOURCE_ALREADY_EXISTS]: 'Resource already exists',
  [ERROR_CODES.DUPLICATE_ISBN]: 'A book with this ISBN already exists',
  
  [ERROR_CODES.INTERNAL_SERVER_ERROR]: 'Internal server error occurred',
  [ERROR_CODES.DATABASE_ERROR]: 'Database operation failed',
  [ERROR_CODES.UNKNOWN_ERROR]: 'An unknown error occurred',
} as const;

// Success messages for consistent API responses
export const SUCCESS_MESSAGES = {
  BOOK_CREATED: 'Book created successfully',
  BOOK_UPDATED: 'Book updated successfully',
  BOOK_DELETED: 'Book deleted successfully',
  BOOKS_RETRIEVED: 'Books retrieved successfully',
  BOOK_RETRIEVED: 'Book retrieved successfully',
} as const;

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
export type ErrorMessage = typeof ERROR_MESSAGES[keyof typeof ERROR_MESSAGES];
export type SuccessMessage = typeof SUCCESS_MESSAGES[keyof typeof SUCCESS_MESSAGES]; 