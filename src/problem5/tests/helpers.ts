import { Express } from 'express';
import request from 'supertest';

/**
 * Test helpers for API testing
 */

export const API_KEY = 'test-api-key-12345';

/**
 * Make an authenticated request with API key
 */
export const authenticatedRequest = (app: Express, method: 'get' | 'post' | 'put' | 'delete', path: string) => {
  return request(app)[method](path).set('x-api-key', API_KEY);
};

/**
 * Create a test resource
 */
export const createTestResource = async (app: Express, data?: Partial<any>) => {
  const defaultData = {
    name: 'Test Resource',
    description: 'Test Description',
    category: 'test',
    status: 'active',
  };

  const response = await authenticatedRequest(app, 'post', '/api/resources')
    .send({ ...defaultData, ...data });

  return response;
};

/**
 * Clean up all resources in the test database
 */
export const cleanupResources = async (app: Express) => {
  const response = await authenticatedRequest(app, 'get', '/api/resources');

  if (response.body.data && Array.isArray(response.body.data)) {
    for (const resource of response.body.data) {
      await authenticatedRequest(app, 'delete', `/api/resources/${resource.id}`);
    }
  }
};

/**
 * Wait for a specified duration
 */
export const wait = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Generate a large payload for testing size limits
 */
export const generateLargePayload = (size: number): string => {
  return 'A'.repeat(size);
};

/**
 * Test data generators
 */
export const testData = {
  validResource: {
    name: 'Valid Resource',
    description: 'A valid test resource',
    category: 'test',
    status: 'active' as const,
  },

  invalidResource: {
    name: '', // Empty name - should fail validation
    description: 'Invalid resource',
  },

  xssPayload: {
    name: '<script>alert("XSS")</script>Test',
    description: '<img src=x onerror="alert(1)">',
    category: 'test',
  },

  sqlInjectionPayload: {
    name: "'; DROP TABLE resources; --",
    description: "Robert'); DROP TABLE students;--",
    category: 'test',
  },

  noSqlInjectionPayload: {
    name: { $gt: '' },
    description: { $ne: null },
  },
};

/**
 * Assert helpers
 */
export const expectSuccessResponse = (response: any) => {
  expect(response.body).toHaveProperty('success', true);
  expect(response.body).toHaveProperty('data');
};

export const expectErrorResponse = (response: any, message?: string) => {
  expect(response.body).toHaveProperty('success', false);
  expect(response.body).toHaveProperty('error');

  if (message) {
    expect(response.body.error).toContain(message);
  }
};

export const expectValidResource = (resource: any) => {
  expect(resource).toHaveProperty('id');
  expect(resource).toHaveProperty('name');
  expect(resource).toHaveProperty('status');
  expect(resource).toHaveProperty('created_at');
  expect(resource).toHaveProperty('updated_at');
};
