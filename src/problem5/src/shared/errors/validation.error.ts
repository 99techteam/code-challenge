/**
 * ValidationError is thrown when input data fails validation checks.
 * It typically maps to an HTTP 422 Unprocessable Entity response.
 */
export class ValidationError extends Error {
  public readonly statusCode: number;

  constructor(message: string = 'Validation failed') {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 422;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }
}
