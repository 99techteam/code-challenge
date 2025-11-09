import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';

/**
 * Configure Helmet.js security headers
 * Helmet helps secure Express apps by setting various HTTP headers
 */
export const helmetConfig = helmet({
  // Content Security Policy - helps prevent XSS attacks
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  // Prevent clickjacking by restricting iframe embedding
  frameguard: {
    action: 'deny',
  },
  // Hide X-Powered-By header
  hidePoweredBy: true,
  // Strict Transport Security - force HTTPS connections
  hsts: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true,
  },
  // Prevent MIME type sniffing
  noSniff: true,
  // Set X-XSS-Protection header
  xssFilter: true,
});

/**
 * MongoDB injection sanitization middleware
 * Removes $ and . characters from user input to prevent NoSQL injection
 */
export const mongoSanitizeMiddleware = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ key }) => {
    console.warn(`Sanitized potentially malicious key: ${key}`);
  },
});

/**
 * Custom XSS sanitization middleware
 * Sanitizes user input to prevent XSS attacks
 */
export const xssSanitize = (req: Request, _res: Response, next: NextFunction) => {
  const sanitizeValue = (value: any): any => {
    if (typeof value === 'string') {
      // Remove potentially dangerous HTML/script tags and entities
      return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
        .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove inline event handlers
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/data:text\/html/gi, ''); // Remove data URLs with HTML
    }

    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }

    if (value !== null && typeof value === 'object') {
      const sanitized: any = {};
      for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          sanitized[key] = sanitizeValue(value[key]);
        }
      }
      return sanitized;
    }

    return value;
  };

  // Sanitize request body
  if (req.body) {
    req.body = sanitizeValue(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeValue(req.query);
  }

  // Sanitize URL parameters
  if (req.params) {
    req.params = sanitizeValue(req.params);
  }

  next();
};

/**
 * Rate limiting prevention headers
 * Add custom security headers for additional protection
 */
export const securityHeaders = (_req: Request, res: Response, next: NextFunction) => {
  // Prevent browsers from guessing MIME types
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable browser XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Prevent iframe embedding (clickjacking protection)
  res.setHeader('X-Frame-Options', 'DENY');

  // Referrer policy - control how much referrer information is shared
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy - restrict browser features
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  next();
};

/**
 * Input validation middleware
 * Validates that incoming data doesn't exceed size limits
 */
export const validateInputSize = (maxBodySize: number = 1024 * 100) => { // Default 100KB
  return (req: Request, res: Response, next: NextFunction) => {
    const bodySize = JSON.stringify(req.body || {}).length;

    if (bodySize > maxBodySize) {
      return res.status(413).json({
        success: false,
        error: 'Request payload too large',
        maxSize: `${maxBodySize / 1024}KB`,
      });
    }

    next();
  };
};
