import { type ErrorRequestHandler, type NextFunction, type Request, type Response } from "express";

/**
 * @description Represents an HTTP-safe error returned by the API layer.
 */
export class HttpError extends Error {
  /**
   * @description Creates an error with a response status code.
   * @param statusCode - HTTP status code sent to the client.
   * @param message - Public error message sent to the client.
   */
  public constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
  }
}

/**
 * @description Converts known application errors into JSON responses.
 */
export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction,
) => {
  if (error instanceof HttpError) {
    response.status(error.statusCode).json({ error: error.message });
    return;
  }

  console.error(error);
  response.status(500).json({ error: "Internal server error" });
};
