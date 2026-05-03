import "express";

declare global {
  namespace Express {
    interface Request {
      /** Per-request correlation ID. Echoed in the X-Request-Id response header. */
      requestId: string;
    }
  }
}
