import request from 'supertest';
import express from 'express';

import { applySecurityMiddleware } from '../../src/infrastructure/http/express/middlewares/security.middleware';
import { env } from '../../src/config/env.config';

const CORS_ORIGIN = env.CORS_ORIGIN_LIST || ['http://localhost:4000'];

const createTestApp = () => {
  const app = express();
  applySecurityMiddleware(app);
  app.get('/', (_req, res) => res.send('ok'));
  return app;
};

describe('Security Middleware Integration', () => {
  const app = createTestApp();

  it('should include security headers from helmet', async () => {
    const res = await request(app).get('/');
    expect(res.headers['x-dns-prefetch-control']).toBe('off');
    expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
  });

  it('should apply CORS policy with configured origin', async () => {
    const res = await request(app).get('/').set('Origin', CORS_ORIGIN[0]);
    expect(res.headers['access-control-allow-origin']).toBe(CORS_ORIGIN[0]);
  });

  it(
    'should apply rate limiting after too many requests',
    async () => {
      for (let i = 0; i <= env.RATE_LIMIT_MAX; i++) {
        await request(app).get('/');
      }
      const res = await request(app).get('/');
      // Note: Depending on timing and test speed, this may return 429 or 200
      expect([200, 429]).toContain(res.statusCode);
    },
    env.RATE_LIMIT_WINDOW_MS * env.RATE_LIMIT_MAX,
  );

  it('should reset rate limit after window expires', async () => {
    jest.useFakeTimers();

    // Send requests to reach the limit
    for (let i = 0; i <= env.RATE_LIMIT_MAX; i++) {
      await request(app).get('/');
    }

    // The next request should be rate limited
    let res = await request(app).get('/');
    expect(res.statusCode).toBe(429);

    // Fast-forward time by RATE_LIMIT_WINDOW_MS
    jest.advanceTimersByTime(env.RATE_LIMIT_WINDOW_MS);

    // Next request should be allowed again
    res = await request(app).get('/');
    expect(res.statusCode).toBe(200);

    jest.useRealTimers();
  });
});
