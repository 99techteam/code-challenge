import request from 'supertest';
import { initializeDatabase } from '../src/config/database';
import app from '../src/app';
import {
  authenticatedRequest,
  createTestResource,
  cleanupResources,
  expectSuccessResponse,
  expectErrorResponse,
  expectValidResource,
} from './helpers';

describe('API Integration Tests', () => {
  beforeAll(async () => {
    await initializeDatabase();
  });

  beforeEach(async () => {
    await cleanupResources(app);
  });

  describe('Health Check', () => {
    it('should return 200 OK for health endpoint', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Server is running');
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('POST /api/resources', () => {
    it('should create a new resource with valid data', async () => {
      const resourceData = {
        name: 'Test Resource',
        description: 'Test Description',
        category: 'test',
        status: 'active',
      };

      const response = await createTestResource(app, resourceData);

      expect(response.status).toBe(201);
      expectSuccessResponse(response);
      expectValidResource(response.body.data);
      expect(response.body.data.name).toBe(resourceData.name);
      expect(response.body.data.description).toBe(resourceData.description);
      expect(response.body.data.category).toBe(resourceData.category);
      expect(response.body.data.status).toBe(resourceData.status);
    });

    it('should create resource with only required fields', async () => {
      const resourceData = {
        name: 'Minimal Resource',
      };

      const response = await createTestResource(app, resourceData);

      expect(response.status).toBe(201);
      expectSuccessResponse(response);
      expect(response.body.data.name).toBe(resourceData.name);
      expect(response.body.data.status).toBe('active'); // Default value
    });

    it('should reject resource without name', async () => {
      const resourceData = {
        description: 'No name provided',
        category: 'test',
      };

      const response = await authenticatedRequest(app, 'post', '/api/resources')
        .send(resourceData);

      expect(response.status).toBe(400);
      expectErrorResponse(response);
    });

    it('should reject invalid status value', async () => {
      const resourceData = {
        name: 'Test',
        status: 'invalid_status',
      };

      const response = await authenticatedRequest(app, 'post', '/api/resources')
        .send(resourceData);

      expect(response.status).toBe(400);
      expectErrorResponse(response);
    });

    it('should reject name longer than 255 characters', async () => {
      const resourceData = {
        name: 'A'.repeat(256),
        description: 'Test',
      };

      const response = await authenticatedRequest(app, 'post', '/api/resources')
        .send(resourceData);

      expect(response.status).toBe(400);
      expectErrorResponse(response);
    });
  });

  describe('GET /api/resources', () => {
    beforeEach(async () => {
      // Create test resources
      await createTestResource(app, { name: 'Resource 1', category: 'cat1', status: 'active' });
      await createTestResource(app, { name: 'Resource 2', category: 'cat2', status: 'inactive' });
      await createTestResource(app, { name: 'Resource 3', category: 'cat1', status: 'active' });
    });

    it('should list all resources', async () => {
      const response = await authenticatedRequest(app, 'get', '/api/resources');

      expect(response.status).toBe(200);
      expectSuccessResponse(response);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(3);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.total).toBeGreaterThanOrEqual(3);
    });

    it('should filter resources by category', async () => {
      const response = await authenticatedRequest(app, 'get', '/api/resources')
        .query({ category: 'cat1' });

      expect(response.status).toBe(200);
      expectSuccessResponse(response);
      expect(response.body.data.length).toBe(2);
      response.body.data.forEach((resource: any) => {
        expect(resource.category).toBe('cat1');
      });
    });

    it('should filter resources by status', async () => {
      const response = await authenticatedRequest(app, 'get', '/api/resources')
        .query({ status: 'active' });

      expect(response.status).toBe(200);
      expectSuccessResponse(response);
      response.body.data.forEach((resource: any) => {
        expect(resource.status).toBe('active');
      });
    });

    it('should filter resources by name', async () => {
      const response = await authenticatedRequest(app, 'get', '/api/resources')
        .query({ name: 'Resource 2' });

      expect(response.status).toBe(200);
      expectSuccessResponse(response);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      expect(response.body.data[0].name).toContain('Resource 2');
    });

    it('should support pagination with limit', async () => {
      const response = await authenticatedRequest(app, 'get', '/api/resources')
        .query({ limit: 2 });

      expect(response.status).toBe(200);
      expectSuccessResponse(response);
      expect(response.body.data.length).toBeLessThanOrEqual(2);
      expect(response.body.pagination.limit).toBe(2);
    });

    it('should support pagination with offset', async () => {
      const response = await authenticatedRequest(app, 'get', '/api/resources')
        .query({ limit: 2, offset: 1 });

      expect(response.status).toBe(200);
      expectSuccessResponse(response);
      expect(response.body.pagination.offset).toBe(1);
    });

    it('should return empty array when no resources match filter', async () => {
      const response = await authenticatedRequest(app, 'get', '/api/resources')
        .query({ category: 'nonexistent' });

      expect(response.status).toBe(200);
      expectSuccessResponse(response);
      expect(response.body.data).toEqual([]);
      expect(response.body.pagination.total).toBe(0);
    });
  });

  describe('GET /api/resources/:id', () => {
    it('should get resource by ID', async () => {
      const createResponse = await createTestResource(app, { name: 'Get Test' });
      const resourceId = createResponse.body.data.id;

      const response = await authenticatedRequest(app, 'get', `/api/resources/${resourceId}`);

      expect(response.status).toBe(200);
      expectSuccessResponse(response);
      expectValidResource(response.body.data);
      expect(response.body.data.id).toBe(resourceId);
      expect(response.body.data.name).toBe('Get Test');
    });

    it('should return 404 for non-existent resource', async () => {
      const response = await authenticatedRequest(app, 'get', '/api/resources/99999');

      expect(response.status).toBe(404);
      expectErrorResponse(response, 'not found');
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await authenticatedRequest(app, 'get', '/api/resources/invalid');

      expect(response.status).toBe(400);
      expectErrorResponse(response);
    });
  });

  describe('PUT /api/resources/:id', () => {
    it('should update resource with valid data', async () => {
      const createResponse = await createTestResource(app, { name: 'Original Name' });
      const resourceId = createResponse.body.data.id;

      const updateData = {
        name: 'Updated Name',
        description: 'Updated Description',
        status: 'inactive',
      };

      const response = await authenticatedRequest(app, 'put', `/api/resources/${resourceId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expectSuccessResponse(response);
      expect(response.body.data.id).toBe(resourceId);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.description).toBe(updateData.description);
      expect(response.body.data.status).toBe(updateData.status);
    });

    it('should update only specified fields', async () => {
      const createResponse = await createTestResource(app, {
        name: 'Original',
        description: 'Original Description',
        category: 'original',
      });
      const resourceId = createResponse.body.data.id;

      const updateData = { name: 'Updated Only' };

      const response = await authenticatedRequest(app, 'put', `/api/resources/${resourceId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('Updated Only');
      expect(response.body.data.description).toBe('Original Description');
      expect(response.body.data.category).toBe('original');
    });

    it('should return 404 when updating non-existent resource', async () => {
      const response = await authenticatedRequest(app, 'put', '/api/resources/99999')
        .send({ name: 'Updated' });

      expect(response.status).toBe(404);
      expectErrorResponse(response, 'not found');
    });

    it('should reject update with invalid status', async () => {
      const createResponse = await createTestResource(app, { name: 'Test' });
      const resourceId = createResponse.body.data.id;

      const response = await authenticatedRequest(app, 'put', `/api/resources/${resourceId}`)
        .send({ status: 'invalid_status' });

      expect(response.status).toBe(400);
      expectErrorResponse(response);
    });

    it('should reject update with empty name', async () => {
      const createResponse = await createTestResource(app, { name: 'Test' });
      const resourceId = createResponse.body.data.id;

      const response = await authenticatedRequest(app, 'put', `/api/resources/${resourceId}`)
        .send({ name: '' });

      expect(response.status).toBe(400);
      expectErrorResponse(response);
    });
  });

  describe('DELETE /api/resources/:id', () => {
    it('should delete existing resource', async () => {
      const createResponse = await createTestResource(app, { name: 'To Delete' });
      const resourceId = createResponse.body.data.id;

      const response = await authenticatedRequest(app, 'delete', `/api/resources/${resourceId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');

      // Verify resource is actually deleted
      const getResponse = await authenticatedRequest(app, 'get', `/api/resources/${resourceId}`);
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 when deleting non-existent resource', async () => {
      const response = await authenticatedRequest(app, 'delete', '/api/resources/99999');

      expect(response.status).toBe(404);
      expectErrorResponse(response, 'not found');
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await authenticatedRequest(app, 'delete', '/api/resources/invalid');

      expect(response.status).toBe(400);
      expectErrorResponse(response);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app).get('/api/nonexistent');

      expect(response.status).toBe(404);
      expectErrorResponse(response);
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/resources')
        .set('Content-Type', 'application/json')
        .set('x-api-key', 'test-api-key-12345')
        .send('{ invalid json }');

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });
});
