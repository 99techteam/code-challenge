/**
 * NotFoundError is thrown when a requested resource cannot be found.
 * It typically maps to an HTTP 404 Not Found response.
 */
export class NotFoundError extends Error {
  public readonly statusCode: number;

  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;

    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NotFoundError);
    }
  }
}
