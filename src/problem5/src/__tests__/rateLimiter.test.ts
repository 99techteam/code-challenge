import { TokenBucket, TokenBucketConfig } from '../middleware/rateLimiter';

describe('TokenBucket', () => {
  let tokenBucket: TokenBucket;
  const config: TokenBucketConfig = {
    capacity: 10,
    refillRate: 1, // 1 token per second
    keyPrefix: 'test'
  };

  beforeEach(() => {
    tokenBucket = new TokenBucket(config);
    jest.clearAllMocks();
  });

  afterEach(() => {
    tokenBucket.reset();
  });

  describe('Basic Token Consumption', () => {
    it('should allow requests when tokens are available', async () => {
      const result = await tokenBucket.consume('client1');
      
      expect(result.allowed).toBe(true);
      expect(result.remainingTokens).toBe(9);
      expect(result.retryAfterSeconds).toBeUndefined();
    });

    it('should reject requests when no tokens available', async () => {
      // Consume all tokens
      for (let i = 0; i < 10; i++) {
        await tokenBucket.consume('client1');
      }

      const result = await tokenBucket.consume('client1');
      
      expect(result.allowed).toBe(false);
      expect(result.remainingTokens).toBe(0);
      expect(result.retryAfterSeconds).toBeGreaterThan(0);
    });

    it('should track different clients separately', async () => {
      await tokenBucket.consume('client1');
      await tokenBucket.consume('client2');

      const status1 = await tokenBucket.getStatus('client1');
      const status2 = await tokenBucket.getStatus('client2');

      expect(status1.remainingTokens).toBe(9);
      expect(status2.remainingTokens).toBe(9);
    });
  });

  describe('Token Refill Mechanism', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should refill tokens over time', async () => {
      // Consume all tokens
      for (let i = 0; i < 10; i++) {
        await tokenBucket.consume('client1');
      }

      // Should be empty
      let result = await tokenBucket.consume('client1');
      expect(result.allowed).toBe(false);

      // Advance time by 2 seconds (should refill 2 tokens)
      jest.advanceTimersByTime(2000);

      result = await tokenBucket.consume('client1');
      expect(result.allowed).toBe(true);
      expect(result.remainingTokens).toBe(1); // Had 2, consumed 1
    });

    it('should not exceed capacity when refilling', async () => {
      // Start with full bucket, advance time significantly
      jest.advanceTimersByTime(60000); // 60 seconds

      const status = await tokenBucket.getStatus('client1');
      expect(status.remainingTokens).toBe(config.capacity);
    });

    it('should calculate correct retry time', async () => {
      // Consume all tokens
      for (let i = 0; i < 10; i++) {
        await tokenBucket.consume('client1');
      }

      const result = await tokenBucket.consume('client1');
      expect(result.retryAfterSeconds).toBe(1); // Need 1 token, refill rate is 1/second
    });
  });

  describe('Edge Cases', () => {
    it('should handle fractional refill rates', async () => {
      const fractionalBucket = new TokenBucket({
        capacity: 60,
        refillRate: 1/60, // 1 token per minute
        keyPrefix: 'test_fractional'
      });

      // Consume all tokens
      for (let i = 0; i < 60; i++) {
        await fractionalBucket.consume('client1');
      }

      const result = await fractionalBucket.consume('client1');
      expect(result.allowed).toBe(false);
      expect(result.retryAfterSeconds).toBe(60); // Should wait 60 seconds for next token
    });

    it('should initialize new clients with full capacity', async () => {
      const result = await tokenBucket.consume('new_client');
      expect(result.remainingTokens).toBe(9); // Full capacity minus 1 consumed
    });

    it('should handle concurrent requests correctly', async () => {
      const promises = [];
      
      // Create 15 concurrent requests (more than capacity)
      for (let i = 0; i < 15; i++) {
        promises.push(tokenBucket.consume('client1'));
      }

      const results = await Promise.all(promises);
      const allowedCount = results.filter(r => r.allowed).length;
      const rejectedCount = results.filter(r => !r.allowed).length;

      expect(allowedCount).toBe(10); // Only capacity should be allowed
      expect(rejectedCount).toBe(5); // Rest should be rejected
    });
  });

  describe('Status Queries', () => {
    it('should return status without consuming tokens', async () => {
      const initialStatus = await tokenBucket.getStatus('client1');
      expect(initialStatus.remainingTokens).toBe(10);

      // Status check shouldn't consume tokens
      const secondStatus = await tokenBucket.getStatus('client1');
      expect(secondStatus.remainingTokens).toBe(10);
    });

    it('should reflect consumed tokens in status', async () => {
      await tokenBucket.consume('client1');
      await tokenBucket.consume('client1');

      const status = await tokenBucket.getStatus('client1');
      expect(status.remainingTokens).toBe(8);
    });
  });

  describe('Reset Functionality', () => {
    it('should reset specific client', async () => {
      await tokenBucket.consume('client1');
      await tokenBucket.consume('client2');

      tokenBucket.reset('client1');

      const status1 = await tokenBucket.getStatus('client1');
      const status2 = await tokenBucket.getStatus('client2');

      expect(status1.remainingTokens).toBe(10); // Reset to full
      expect(status2.remainingTokens).toBe(9);  // Unchanged
    });

    it('should reset all clients when no key provided', async () => {
      await tokenBucket.consume('client1');
      await tokenBucket.consume('client2');

      tokenBucket.reset();

      const status1 = await tokenBucket.getStatus('client1');
      const status2 = await tokenBucket.getStatus('client2');

      expect(status1.remainingTokens).toBe(10);
      expect(status2.remainingTokens).toBe(10);
    });
  });

  describe('Configuration', () => {
    it('should return correct configuration', () => {
      const returnedConfig = tokenBucket.getConfig();
      expect(returnedConfig.capacity).toBe(config.capacity);
      expect(returnedConfig.refillRate).toBe(config.refillRate);
      expect(returnedConfig.keyPrefix).toBe(config.keyPrefix);
    });

    it('should use default key prefix when not provided', () => {
      const bucketWithoutPrefix = new TokenBucket({
        capacity: 10,
        refillRate: 1
      });

      const bucketConfig = bucketWithoutPrefix.getConfig();
      expect(bucketConfig.keyPrefix).toBe('rate_limit');
    });
  });
});
