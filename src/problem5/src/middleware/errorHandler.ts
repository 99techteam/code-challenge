import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors";

/**
 * Global error handler middleware.
 * Catches all errors thrown in controllers/services and returns a consistent JSON response.
 */
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // Unexpected errors
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error." });
}

