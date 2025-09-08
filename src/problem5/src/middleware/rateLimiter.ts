/**
 * Token Bucket Rate Limiter Implementation
 * 
 * Based on the Token Bucket algorithm used by industry leaders:
 * - Amazon API Gateway
 * - Google Cloud APIs
 * - Stripe API
 * 
 * Algorithm:
 * - A bucket has a maximum capacity of tokens
 * - Tokens are refilled at a constant rate
 * - Each request consumes one token
 * - If no tokens available, request is rejected
 */

export interface TokenBucketConfig {
  capacity: number;      // Maximum tokens in bucket
  refillRate: number;    // Tokens added per second
  keyPrefix?: string;    // Prefix for storage keys
}

export interface TokenBucketState {
  tokens: number;        // Current available tokens
  lastRefill: number;    // Last refill timestamp (ms)
}

export interface RateLimitResult {
  allowed: boolean;      // Whether request is allowed
  remainingTokens: number; // Tokens remaining after this request
  retryAfterSeconds?: number; // When to retry if rejected
  resetTime: number;     // When bucket will be full again
}

export class TokenBucket {
  private config: TokenBucketConfig;
  private storage: Map<string, TokenBucketState>;

  constructor(config: TokenBucketConfig) {
    this.config = {
      keyPrefix: 'rate_limit',
      ...config
    };
    this.storage = new Map();
  }

  /**
   * Check if request should be allowed and consume token if available
   */
  public async consume(key: string): Promise<RateLimitResult> {
    const now = Date.now();
    const bucketKey = `${this.config.keyPrefix}:${key}`;
    
    // Get current bucket state
    let bucket = this.storage.get(bucketKey);
    
    if (!bucket) {
      // Initialize new bucket with full capacity
      bucket = {
        tokens: this.config.capacity,
        lastRefill: now
      };
    }

    // Calculate tokens to add based on time elapsed
    const timeDelta = (now - bucket.lastRefill) / 1000; // Convert to seconds
    const tokensToAdd = Math.floor(timeDelta * this.config.refillRate);
    
    if (tokensToAdd > 0) {
      bucket.tokens = Math.min(
        this.config.capacity,
        bucket.tokens + tokensToAdd
      );
      bucket.lastRefill = now;
    }

    // Check if request can be allowed
    const allowed = bucket.tokens >= 1;
    let remainingTokens = bucket.tokens;
    let retryAfterSeconds: number | undefined;

    if (allowed) {
      // Consume one token
      bucket.tokens -= 1;
      remainingTokens = bucket.tokens;
    } else {
      // Calculate retry after time
      retryAfterSeconds = Math.ceil((1 - bucket.tokens) / this.config.refillRate);
    }

    // Calculate when bucket will be full again
    const tokensNeeded = this.config.capacity - bucket.tokens;
    const resetTime = now + (tokensNeeded / this.config.refillRate) * 1000;

    // Update storage
    this.storage.set(bucketKey, bucket);

    return {
      allowed,
      remainingTokens,
      retryAfterSeconds,
      resetTime
    };
  }

  /**
   * Get current bucket status without consuming tokens
   */
  public async getStatus(key: string): Promise<Omit<RateLimitResult, 'allowed'>> {
    const now = Date.now();
    const bucketKey = `${this.config.keyPrefix}:${key}`;
    
    let bucket = this.storage.get(bucketKey);
    
    if (!bucket) {
      bucket = {
        tokens: this.config.capacity,
        lastRefill: now
      };
    }

    // Calculate current tokens without updating state
    const timeDelta = (now - bucket.lastRefill) / 1000;
    const tokensToAdd = Math.floor(timeDelta * this.config.refillRate);
    const currentTokens = Math.min(
      this.config.capacity,
      bucket.tokens + tokensToAdd
    );

    const tokensNeeded = this.config.capacity - currentTokens;
    const resetTime = now + (tokensNeeded / this.config.refillRate) * 1000;

    return {
      remainingTokens: currentTokens,
      retryAfterSeconds: currentTokens < 1 ? Math.ceil((1 - currentTokens) / this.config.refillRate) : undefined,
      resetTime
    };
  }

  /**
   * Reset bucket for a specific key (useful for testing)
   */
  public reset(key?: string): void {
    if (key) {
      const bucketKey = `${this.config.keyPrefix}:${key}`;
      this.storage.delete(bucketKey);
    } else {
      this.storage.clear();
    }
  }

  /**
   * Get configuration
   */
  public getConfig(): TokenBucketConfig {
    return { ...this.config };
  }
}
