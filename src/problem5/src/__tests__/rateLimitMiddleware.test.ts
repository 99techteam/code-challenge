import request from 'supertest';
import express from 'express';
import { createRateLimitMiddleware, createConfiguredRateLimiter } from '../middleware/rateLimitMiddleware';
import { metricsCollector } from '../controllers/metricsController';

describe('Rate Limiting Middleware Integration', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    metricsCollector.reset();
  });

  describe('Basic Rate Limiting', () => {
    beforeEach(() => {
      // Create a strict rate limiter for testing
      const rateLimiter = createRateLimitMiddleware({
        capacity: 3,
        refillRate: 1, // 1 token per second
        keyPrefix: 'test'
      });

      app.use('/api', rateLimiter);
      app.get('/api/test', (req, res) => {
        res.json({ success: true, message: 'Request allowed' });
      });
    });

    it('should allow requests within limit', async () => {
      // Make 3 requests (within capacity)
      for (let i = 0; i < 3; i++) {
        const response = await request(app)
          .get('/api/test')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.headers['x-ratelimit-limit']).toBe('3');
        expect(response.headers['x-ratelimit-remaining']).toBe((2 - i).toString());
      }
    });

    it('should reject requests exceeding limit', async () => {
      // Make 3 requests to exhaust capacity
      for (let i = 0; i < 3; i++) {
        await request(app).get('/api/test').expect(200);
      }

      // 4th request should be rate limited
      const response = await request(app)
        .get('/api/test')
        .expect(429);

      expect(response.body.error).toBe('Rate limit exceeded');
      expect(response.body.retry_after_seconds).toBeGreaterThan(0);
      expect(response.headers['retry-after']).toBeDefined();
    });

    it('should set correct rate limit headers', async () => {
      const response = await request(app)
        .get('/api/test')
        .expect(200);

      expect(response.headers['x-ratelimit-limit']).toBe('3');
      expect(response.headers['x-ratelimit-remaining']).toBe('2');
      expect(response.headers['x-ratelimit-reset']).toBeDefined();
    });

    it('should differentiate between different IPs', async () => {
      // Mock different IPs
      const ip1 = '192.168.1.1';
      const ip2 = '192.168.1.2';

      // Each IP should have its own limit
      for (let i = 0; i < 3; i++) {
        await request(app)
          .get('/api/test')
          .set('X-Forwarded-For', ip1)
          .expect(200);

        await request(app)
          .get('/api/test')
          .set('X-Forwarded-For', ip2)
          .expect(200);
      }

      // Both should be exhausted now
      await request(app)
        .get('/api/test')
        .set('X-Forwarded-For', ip1)
        .expect(429);

      await request(app)
        .get('/api/test')
        .set('X-Forwarded-For', ip2)
        .expect(429);
    });
  });

  describe('Configuration-based Rate Limiting', () => {
    beforeEach(() => {
      process.env.RATE_LIMIT_CAPACITY = '5';
      process.env.RATE_LIMIT_REFILL_RATE = '2';

      const rateLimiter = createConfiguredRateLimiter();
      app.use('/api', rateLimiter);
      app.get('/api/test', (req, res) => {
        res.json({ success: true });
      });
    });

    afterEach(() => {
      delete process.env.RATE_LIMIT_CAPACITY;
      delete process.env.RATE_LIMIT_REFILL_RATE;
    });

    it('should use environment configuration', async () => {
      // Should allow 5 requests
      for (let i = 0; i < 5; i++) {
        await request(app).get('/api/test').expect(200);
      }

      // 6th should be rejected
      await request(app).get('/api/test').expect(429);
    });
  });

  describe('Custom Key Generation', () => {
    beforeEach(() => {
      const rateLimiter = createRateLimitMiddleware({
        capacity: 2,
        refillRate: 1,
        keyGenerator: (req) => req.headers['user-id'] as string || 'anonymous'
      });

      app.use('/api', rateLimiter);
      app.get('/api/test', (req, res) => {
        res.json({ success: true });
      });
    });

    it('should use custom key generator', async () => {
      // Different user IDs should have separate limits
      await request(app)
        .get('/api/test')
        .set('User-ID', 'user1')
        .expect(200);

      await request(app)
        .get('/api/test')
        .set('User-ID', 'user1')
        .expect(200);

      await request(app)
        .get('/api/test')
        .set('User-ID', 'user2')
        .expect(200);

      // user1 should be rate limited, user2 should not
      await request(app)
        .get('/api/test')
        .set('User-ID', 'user1')
        .expect(429);

      await request(app)
        .get('/api/test')
        .set('User-ID', 'user2')
        .expect(200);
    });
  });

  describe('Error Handling', () => {
    it('should fail open on rate limiter errors', async () => {
      // Create a rate limiter that might throw an error
      const faultyRateLimiter = createRateLimitMiddleware({
        capacity: 1,
        refillRate: 1,
        keyGenerator: () => {
          throw new Error('Key generation failed');
        }
      });

      app.use('/api', faultyRateLimiter);
      app.get('/api/test', (req, res) => {
        res.json({ success: true });
      });

      // Should still allow request despite error
      const response = await request(app)
        .get('/api/test')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Time-based Token Refill', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should allow requests after token refill', async () => {
      const rateLimiter = createRateLimitMiddleware({
        capacity: 1,
        refillRate: 1, // 1 token per second
        keyPrefix: 'test_refill'
      });

      app.use('/api', rateLimiter);
      app.get('/api/test', (req, res) => {
        res.json({ success: true });
      });

      // Consume the only token
      await request(app).get('/api/test').expect(200);

      // Next request should be rate limited
      await request(app).get('/api/test').expect(429);

      // Advance time by 1 second
      jest.advanceTimersByTime(1000);

      // Should be able to make request again
      await request(app).get('/api/test').expect(200);
    });
  });
});
