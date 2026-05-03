import type { RequestHandler } from "express";
import { randomUUID } from "node:crypto";

const HEADER = "x-request-id";

// Allow opaque-but-safe values: alnum + a small set of separators, max 128 chars.
// Rejects CRLF and other control chars so a forged header cannot inject log
// fields or response splits downstream.
const SAFE_RE = /^[A-Za-z0-9_\-.:=+]{1,128}$/;

/**
 * Honour an inbound `X-Request-Id` if present (typical when behind an LB that
 * generates it), otherwise mint a UUIDv4. Always echo back so the client can
 * correlate with server-side logs.
 */
export const requestId = (): RequestHandler => (req, res, next) => {
  const incoming = req.header(HEADER);
  const id = incoming && SAFE_RE.test(incoming) ? incoming : randomUUID();
  req.requestId = id;
  res.setHeader(HEADER, id);
  next();
};
