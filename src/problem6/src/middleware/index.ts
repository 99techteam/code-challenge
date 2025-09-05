/**
 * Application middleware for Scoreboard System
 */

import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import compression from "compression";
import { serverConfig, isDevelopment } from "../config";
import { ApiResponse } from "../types";

/**
 * CORS configuration
 */
export const corsOptions = {
  origin: serverConfig.corsOrigin,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

/**
 * Rate limiting configuration
 */
export const rateLimitConfig = rateLimit({
  windowMs: serverConfig.rateLimitWindowMs, // 15 minutes
  max: serverConfig.rateLimitMaxRequests, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
    error: "Rate limit exceeded",
  } as ApiResponse,
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Score update rate limiting (more restrictive)
 */
export const scoreUpdateRateLimit = rateLimit({
  windowMs: 60000, // 1 minute
  max: 100, // limit to 100 score updates per minute per IP (increased for dev)
  message: {
    success: false,
    message: "Too many score updates. Please slow down.",
    error: "Score update rate limit exceeded",
  } as ApiResponse,
  standardHeaders: true,
  legacyHeaders: false,
});

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
    error: isDevelopment ? error.message : "Something went wrong",
  };

  res.status(500).json(response);
};

/**
 * Request logging middleware
 */
export const requestLogger = morgan(isDevelopment ? "dev" : "combined", {
  skip: (req) => req.url === "/health",
});

/**
 * Security middleware
 */
export const securityMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

/**
 * Compression middleware
 */
export const compressionMiddleware = compression();

/**
 * CORS middleware
 */
export const corsMiddleware = cors(corsOptions);

/**
 * Request ID middleware (for tracing)
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

/**
 * Request timing middleware
 */
export const timingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  req.startTime = Date.now();

  // Set response time header before response is sent
  const originalSend = res.send;
  res.send = function (body) {
    const duration = Date.now() - req.startTime;
    res.setHeader("X-Response-Time", `${duration}ms`);
    return originalSend.call(this, body);
  };

  next();
};
