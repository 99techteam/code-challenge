export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(details: unknown) {
    super(400, 'invalid_input', 'Invalid input', details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(404, 'not_found', `${resource} with id ${id} not found`);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, code = 'conflict') {
    super(409, code, message);
  }
}
