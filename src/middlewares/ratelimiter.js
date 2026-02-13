// src/middleware/rateLimiter.js
import rateLimit, {ipKeyGenerator} from "express-rate-limit";

// Per-user limiter
export const userLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 2,            // Max 2 submissions per user per minute
  keyGenerator: (req) => req.userId || ipKeyGenerator(req),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: "Too many submissions. Limit is 2 per minute per user."
  }
});

// Per-IP limiter
export const ipLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 2,            // Max 2 submissions per IP per minute
  keyGenerator: (req) => ipKeyGenerator,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: "Too many requests from this IP. Limit is 2 per minute."
  }
});