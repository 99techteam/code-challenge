export class HttpError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;

  public constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}
