import { Request, Response, NextFunction } from 'express';
import { TokenBucket, TokenBucketConfig } from './rateLimiter';

export interface RateLimitConfig extends TokenBucketConfig {
  keyGenerator?: (req: Request) => string;
  skipFailedRequests?: boolean;
  skipSuccessfulRequests?: boolean;
  onLimitReached?: (req: Request, res: Response) => void;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: Date;
  retryAfter?: number;
}

// Extend Express Request interface to include rate limit info
declare global {
  namespace Express {
    interface Request {
      rateLimit?: RateLimitInfo;
    }
  }
}

/**
 * Rate limiting middleware using Token Bucket algorithm
 * 
 * Headers set according to industry standards:
 * - X-RateLimit-Limit: Request limit per window
 * - X-RateLimit-Remaining: Requests remaining in window
 * - X-RateLimit-Reset: Unix timestamp when window resets
 * - Retry-After: Seconds to wait before retrying (on 429)
 */
export function createRateLimitMiddleware(config: RateLimitConfig) {
  const bucket = new TokenBucket(config);
  
  // Default key generator uses client IP
  const keyGenerator = config.keyGenerator || ((req: Request) => {
    // Try to get real IP from various headers (common in production)
    const forwarded = req.headers['x-forwarded-for'] as string;
    const realIp = req.headers['x-real-ip'] as string;
    const clientIp = forwarded?.split(',')[0] || realIp || req.socket.remoteAddress || 'unknown';
    return clientIp;
  });

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const key = keyGenerator(req);
      const result = await bucket.consume(key);

      // Set standard rate limit headers
      res.set({
        'X-RateLimit-Limit': config.capacity.toString(),
        'X-RateLimit-Remaining': Math.max(0, result.remainingTokens).toString(),
        'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString()
      });

      // Add rate limit info to request object
      req.rateLimit = {
        limit: config.capacity,
        remaining: Math.max(0, result.remainingTokens),
        reset: new Date(result.resetTime),
        retryAfter: result.retryAfterSeconds
      };

      if (!result.allowed) {
        // Set Retry-After header
        if (result.retryAfterSeconds) {
          res.set('Retry-After', result.retryAfterSeconds.toString());
        }

        // Call custom handler if provided
        if (config.onLimitReached) {
          config.onLimitReached(req, res);
        }

        // Log rate limit violation
        console.warn(`Rate limit exceeded for key: ${key}`, {
          key,
          userAgent: req.headers['user-agent'],
          url: req.url,
          method: req.method,
          timestamp: new Date().toISOString()
        });

        // Return 429 Too Many Requests
        res.status(429).json({
          error: 'Rate limit exceeded',
          message: 'Too many requests, please try again later',
          retry_after_seconds: result.retryAfterSeconds || 60,
          limit: config.capacity,
          reset_time: new Date(result.resetTime).toISOString()
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      // On error, allow request to proceed (fail open)
      next();
    }
  };
}

/**
 * Create rate limiter with environment-based configuration
 */
export function createConfiguredRateLimiter(overrides?: Partial<RateLimitConfig>) {
  const config: RateLimitConfig = {
    capacity: parseInt(process.env.RATE_LIMIT_CAPACITY || '100', 10),
    refillRate: parseFloat(process.env.RATE_LIMIT_REFILL_RATE || '1.67'), // ~100 per minute
    keyPrefix: process.env.RATE_LIMIT_KEY_PREFIX || 'api_rate_limit',
    ...overrides
  };

  // Validate configuration
  if (config.capacity <= 0 || config.refillRate <= 0) {
    throw new Error('Rate limit capacity and refill rate must be positive numbers');
  }

  return createRateLimitMiddleware(config);
}

/**
 * Different rate limit configurations for different endpoints
 */
export const rateLimitProfiles = {
  // Strict limits for auth endpoints
  auth: {
    capacity: 5,
    refillRate: 0.083, // ~5 per minute
  },
  
  // Standard API limits
  api: {
    capacity: 100,
    refillRate: 1.67, // ~100 per minute
  },
  
  // Generous limits for read operations
  read: {
    capacity: 200,
    refillRate: 3.33, // ~200 per minute
  },
  
  // Strict limits for write operations
  write: {
    capacity: 50,
    refillRate: 0.83, // ~50 per minute
  }
};

/**
 * Create rate limiter for specific profile
 */
export function createProfiledRateLimiter(profile: keyof typeof rateLimitProfiles, overrides?: Partial<RateLimitConfig>) {
  const profileConfig = rateLimitProfiles[profile];
  return createConfiguredRateLimiter({
    ...profileConfig,
    ...overrides
  });
}
