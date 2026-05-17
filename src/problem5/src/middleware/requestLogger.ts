import morgan from "morgan";
import type { RequestHandler } from "express";

const FORMAT = '[:date[iso]] :remote-addr :method :url :status :response-time ms';

export const createRequestLogger = (): RequestHandler =>
  morgan(FORMAT, {
    skip: (req) =>
      process.env.NODE_ENV === "test" || req.url === "/health",
  });
