/**
 * Domain error hierarchy.
 *
 * Every operational error thrown by the application is an `AppError` so the
 * error-handler middleware can map it to a consistent HTTP envelope without
 * leaking stack traces. Programmer errors (TypeError, ReferenceError) are not
 * AppError — they bubble to the default Express handler and surface as 500.
 *
 * Public vs internal messages:
 *   - `message`        — internal, includes context, may name the resource id.
 *                        Logged server-side; never sent to the client.
 *   - `publicMessage`  — what the client is allowed to see. Defaults to a
 *                        generic, code-correlated string; subclasses override
 *                        when a specific message is safe to expose.
 */
export class AppError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly publicMessage: string;
  public readonly details?: unknown;

  constructor(args: {
    message: string;
    publicMessage: string;
    code: string;
    status: number;
    details?: unknown;
  }) {
    super(args.message);
    this.name = "AppError";
    this.code = args.code;
    this.status = args.status;
    this.publicMessage = args.publicMessage;
    this.details = args.details;
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super({
      message: `${resource} '${id}' not found`,
      // Deliberately omits the id — clients already know it (they sent it).
      publicMessage: `${resource} not found`,
      code: "NOT_FOUND",
      status: 404,
    });
    this.name = "NotFoundError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super({
      message,
      publicMessage: message,
      code: "VALIDATION_ERROR",
      status: 422,
      details,
    });
    this.name = "ValidationError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super({
      message,
      publicMessage: message,
      code: "CONFLICT",
      status: 409,
    });
    this.name = "ConflictError";
  }
}
