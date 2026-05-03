import type { RequestHandler } from "express";

/**
 * Catch-all for unmatched routes. Returns a JSON 404 in the standard envelope
 * so clients see a uniform shape rather than Express's default HTML.
 */
export const notFound = (): RequestHandler => (req, res) => {
  res.status(404).json({
    ok: false,
    error: {
      code: "ROUTE_NOT_FOUND",
      message: `Route ${req.method} ${req.originalUrl} does not exist`,
    },
  });
};
