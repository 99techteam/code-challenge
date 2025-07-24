/**
 * DatabaseError is thrown when a database operation fails.
 * It typically maps to an HTTP 500 Internal Server Error, but should not expose internal details to the client.
 */
export class DatabaseError extends Error {
  public readonly statusCode: number;

  constructor(message: string = 'Database operation failed') {
    super(message);
    this.name = 'DatabaseError';
    this.statusCode = 500;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DatabaseError);
    }
  }
}
