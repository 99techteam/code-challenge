import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors.js";
import { logger } from "../logger.js";

/**
 * Terminal error handler. Translates any thrown error into the standard
 * response envelope and logs full context server-side.
 *
 * Envelope: { ok: false, error: { code, message, details? } }
 *
 * Never leaks stack traces or internal error messages to the client.
 */
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  // Handle zod errors specifically — they originate from req.body / req.query
  // validation. Translate to 422 with field-level details.
  if (err instanceof ZodError) {
    const details = err.issues.map((i) => ({
      path: i.path.join("."),
      message: i.message,
    }));
    logger.warn({ requestId: req.requestId, details }, "validation failed");
    res.status(422).json({
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed",
        details,
      },
    });
    return;
  }

  if (err instanceof AppError) {
    // Operational error — log at warn (expected category, not a bug)
    logger.warn(
      {
        requestId: req.requestId,
        code: err.code,
        status: err.status,
        details: err.details,
      },
      err.message,
    );
    res.status(err.status).json({
      ok: false,
      error: {
        code: err.code,
        message: err.publicMessage,
        ...(err.details !== undefined ? { details: err.details } : {}),
      },
    });
    return;
  }

  // Programmer error / unknown — log full stack, surface generic message
  logger.error(
    {
      requestId: req.requestId,
      err: {
        name: (err as Error).name,
        message: (err as Error).message,
        stack: (err as Error).stack,
      },
    },
    "unhandled error",
  );
  res.status(500).json({
    ok: false,
    error: { code: "INTERNAL_ERROR", message: "Internal server error" },
  });
};
