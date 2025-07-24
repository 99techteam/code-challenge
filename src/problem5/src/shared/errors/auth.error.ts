/**
 * AuthenticationError is thrown when authentication fails, such as missing or invalid credentials.
 * It typically maps to an HTTP 401 Unauthorized response.
 */
export class AuthenticationError extends Error {
  public readonly statusCode: number;

  constructor(message: string = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = 401;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AuthenticationError);
    }
  }
}

/**
 * AuthorizationError is thrown when a user lacks permission to perform an action.
 * It typically maps to an HTTP 403 Forbidden response.
 */
export class AuthorizationError extends Error {
  public readonly statusCode: number;

  constructor(message: string = 'Access denied') {
    super(message);
    this.name = 'AuthorizationError';
    this.statusCode = 403;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AuthorizationError);
    }
  }
}
