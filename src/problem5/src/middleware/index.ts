/**
 * Application middleware
 */

import { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { ApiResponse } from "../types";

/**
 * CORS configuration
 */
export const corsOptions = {
  origin: process.env.CORS_ORIGIN || "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

/**
 * Error handling middleware
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error("Error:", error);

  const response: ApiResponse = {
    success: false,
    message: "Internal server error",
    error:
      process.env.NODE_ENV === "development"
        ? error.message
        : "Something went wrong",
  };

  res.status(500).json(response);
};

/**
 * Request logging middleware
 */
export const requestLogger = morgan(
  process.env.NODE_ENV === "development" ? "dev" : "combined",
  {
    skip: (req) => req.url === "/health",
  }
);

/**
 * Security middleware
 */
export const securityMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

/**
 * CORS middleware
 */
export const corsMiddleware = cors(corsOptions);

/**
 * Request ID middleware
 */
export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  req.id = Math.random().toString(36).substr(2, 9);
  res.setHeader("X-Request-ID", req.id);
  next();
};
