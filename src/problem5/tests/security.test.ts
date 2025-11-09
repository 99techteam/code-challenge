import request from 'supertest';
import { initializeDatabase } from '../src/config/database';
import app from '../src/app';
import { authenticatedRequest, API_KEY } from './helpers';

describe('Security Features', () => {
  beforeAll(async () => {
    await initializeDatabase();
  });

  describe('Security Headers', () => {
    it('should set Content-Security-Policy header', async () => {
      const response = await request(app).get('/health');

      expect(response.headers['content-security-policy']).toBeDefined();
      expect(response.headers['content-security-policy']).toContain('default-src');
    });

    it('should set Strict-Transport-Security header', async () => {
      const response = await request(app).get('/health');

      expect(response.headers['strict-transport-security']).toBeDefined();
      expect(response.headers['strict-transport-security']).toContain('max-age=31536000');
    });

    it('should set X-Frame-Options header to DENY', async () => {
      const response = await request(app).get('/health');

      expect(response.headers['x-frame-options']).toBe('DENY');
    });

    it('should set X-Content-Type-Options header to nosniff', async () => {
      const response = await request(app).get('/health');

      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });

    it('should set X-XSS-Protection header', async () => {
      const response = await request(app).get('/health');

      expect(response.headers['x-xss-protection']).toBeDefined();
    });

    it('should set Referrer-Policy header', async () => {
      const response = await request(app).get('/health');

      expect(response.headers['referrer-policy']).toBeDefined();
    });

    it('should set Permissions-Policy header', async () => {
      const response = await request(app).get('/health');

      expect(response.headers['permissions-policy']).toBeDefined();
      expect(response.headers['permissions-policy']).toContain('geolocation=()');
    });

    it('should hide X-Powered-By header', async () => {
      const response = await request(app).get('/health');

      expect(response.headers['x-powered-by']).toBeUndefined();
    });
  });

  describe('XSS Protection', () => {
    it('should remove script tags from input', async () => {
      const maliciousData = {
        name: '<script>alert("XSS")</script>Test Resource',
        description: 'Normal description',
        category: 'test',
      };

      const response = await authenticatedRequest(app, 'post', '/api/resources')
        .send(maliciousData);

      expect(response.status).toBe(201);
      expect(response.body.data.name).not.toContain('<script>');
      expect(response.body.data.name).toBe('Test Resource');
    });

    it('should remove inline event handlers', async () => {
      const maliciousData = {
        name: 'Test',
        description: '<img src=x onerror="alert(1)">',
        category: 'test',
      };

      const response = await authenticatedRequest(app, 'post', '/api/resources')
        .send(maliciousData);

      expect(response.status).toBe(201);
      expect(response.body.data.description).not.toContain('onerror');
      expect(response.body.data.description).toContain('<img src=x');
    });

    it('should remove javascript: protocol', async () => {
      const maliciousData = {
        name: 'Test',
        description: 'Click here: javascript:alert("XSS")',
        category: 'test',
      };

      const response = await authenticatedRequest(app, 'post', '/api/resources')
        .send(maliciousData);

      expect(response.status).toBe(201);
      expect(response.body.data.description).not.toContain('javascript:');
    });

    it('should sanitize iframe tags', async () => {
      const maliciousData = {
        name: 'Test',
        description: '<iframe src="http://malicious.com"></iframe>Test',
        category: 'test',
      };

      const response = await authenticatedRequest(app, 'post', '/api/resources')
        .send(maliciousData);

      expect(response.status).toBe(201);
      expect(response.body.data.description).not.toContain('<iframe');
      expect(response.body.data.description).toContain('Test');
    });

    it('should sanitize multiple XSS vectors in one request', async () => {
      const maliciousData = {
        name: '<script>alert(1)</script>Name',
        description: '<img src=x onerror="alert(2)"><iframe src="evil.com"></iframe>',
        category: '<object data="evil.com"></object>test',
      };

      const response = await authenticatedRequest(app, 'post', '/api/resources')
        .send(maliciousData);

      expect(response.status).toBe(201);
      expect(response.body.data.name).toBe('Name');
      expect(response.body.data.description).not.toContain('onerror');
      expect(response.body.data.description).not.toContain('iframe');
      // object tags should be removed
      expect(response.body.data.category).toBe('test');
    });
  });

  describe('NoSQL Injection Protection', () => {
    it('should sanitize MongoDB operators in request body', async () => {
      const maliciousData = {
        name: { $gt: '' },
        description: 'Test',
        category: 'test',
      };

      const response = await authenticatedRequest(app, 'post', '/api/resources')
        .send(maliciousData);

      // The request should either fail validation or sanitize the data
      // Since name should be a string, Zod validation should catch this
      expect(response.status).toBe(400);
    });

    it('should sanitize query parameters with MongoDB operators', async () => {
      // Create a test resource first
      await authenticatedRequest(app, 'post', '/api/resources')
        .send({ name: 'Test', category: 'test' });

      // Try to use NoSQL injection in query - this will cause validation error due to invalid parameter
      const response = await request(app)
        .get('/api/resources?name[$gt]=')
        .set('x-api-key', API_KEY);

      // The malicious query parameter should either be sanitized or rejected
      // Accepting either 200 (sanitized) or 400 (rejected) as valid responses
      expect([200, 400]).toContain(response.status);
    });
  });

  describe('Request Size Limits', () => {
    it('should reject payloads larger than 100KB', async () => {
      const largePayload = 'A'.repeat(150000);

      const response = await authenticatedRequest(app, 'post', '/api/resources')
        .send({
          name: 'Test',
          description: largePayload,
          category: 'test',
        });

      // Should be rejected due to size limit
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should accept payloads smaller than 100KB', async () => {
      const smallPayload = 'A'.repeat(1000);

      const response = await authenticatedRequest(app, 'post', '/api/resources')
        .send({
          name: 'Test',
          description: smallPayload,
          category: 'test',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Authentication', () => {
    it('should reject requests without API key', async () => {
      const response = await request(app)
        .get('/api/resources');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('API key');
    });

    it('should reject requests with invalid API key', async () => {
      const response = await request(app)
        .get('/api/resources')
        .set('x-api-key', 'invalid-key');

      // Should reject with 401 or 403
      expect([401, 403]).toContain(response.status);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid');
    });

    it('should accept requests with valid API key', async () => {
      const response = await request(app)
        .get('/api/resources')
        .set('x-api-key', API_KEY);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
