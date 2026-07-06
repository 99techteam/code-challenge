import request from 'supertest';
import { buildApp } from '../app';

describe('CRUD API Integration Tests', () => {
  const app = buildApp();

  describe('POST /api/resources - Create Resource', () => {
    it('should create a new resource with all fields', async () => {
      const response = await request(app)
        .post('/api/resources')
        .send({
          name: 'Mechanical Keyboard',
          description: 'Cherry MX switches, tenkeyless',
          category: 'electronics',
          status: 'active'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.name).toBe('Mechanical Keyboard');
      expect(response.body.data.category).toBe('electronics');
      expect(response.body.data.id).toBeDefined();
      expect(response.body.message).toContain('created successfully');
    });

    it('should create a resource with minimal fields', async () => {
      const response = await request(app)
        .post('/api/resources')
        .send({ name: 'Desk Lamp' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Desk Lamp');
      expect(response.body.data.status).toBe('active');
    });

    it('should fail without required name field', async () => {
      const response = await request(app)
        .post('/api/resources')
        .send({ description: 'Missing name field' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Name is required');
    });

    it('should fail with empty name', async () => {
      const response = await request(app)
        .post('/api/resources')
        .send({ name: '   ' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/resources - List Resources', () => {
    it('should list all resources', async () => {
      const response = await request(app).get('/api/resources');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.resources).toBeInstanceOf(Array);
      expect(response.body.data.total).toBeDefined();
      expect(typeof response.body.data.total).toBe('number');
    });

    it('should filter resources by category', async () => {
      await request(app)
        .post('/api/resources')
        .send({ name: 'USB-C Hub', category: 'electronics' });

      const response = await request(app).get('/api/resources?category=electronics');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.resources.length).toBeGreaterThan(0);
      response.body.data.resources.forEach((resource: { category: string }) => {
        expect(resource.category).toBe('electronics');
      });
    });

    it('should filter resources by status', async () => {
      const response = await request(app).get('/api/resources?status=active');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      response.body.data.resources.forEach((resource: { status: string }) => {
        expect(resource.status).toBe('active');
      });
    });

    it('should search resources by name', async () => {
      const uniqueName = `SearchTarget-${Date.now()}`;
      await request(app).post('/api/resources').send({ name: uniqueName });

      const response = await request(app).get(`/api/resources?search=${uniqueName}`);

      expect(response.status).toBe(200);
      expect(response.body.data.resources.length).toBeGreaterThan(0);
    });

    it('should support pagination with limit', async () => {
      const response = await request(app).get('/api/resources?limit=5');

      expect(response.status).toBe(200);
      expect(response.body.data.limit).toBe(5);
      expect(response.body.data.resources.length).toBeLessThanOrEqual(5);
    });

    it('should support pagination with offset', async () => {
      const response = await request(app).get('/api/resources?limit=5&offset=2');

      expect(response.status).toBe(200);
      expect(response.body.data.limit).toBe(5);
      expect(response.body.data.offset).toBe(2);
    });
  });

  describe('GET /api/resources/:id - Get Single Resource', () => {
    it('should get a specific resource by ID', async () => {
      const createResponse = await request(app)
        .post('/api/resources')
        .send({ name: 'Monitor Stand' });

      const createdId = createResponse.body.data.id;

      const response = await request(app).get(`/api/resources/${createdId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(createdId);
      expect(response.body.data.name).toBe('Monitor Stand');
    });

    it('should return 404 for non-existent resource', async () => {
      const response = await request(app).get('/api/resources/999999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app).get('/api/resources/invalid-id');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid resource ID');
    });
  });

  describe('PUT /api/resources/:id - Update Resource', () => {
    it('should update a resource successfully', async () => {
      const createResponse = await request(app)
        .post('/api/resources')
        .send({
          name: 'Draft Title',
          description: 'Original copy',
          status: 'active'
        });

      const resourceId = createResponse.body.data.id;

      const response = await request(app)
        .put(`/api/resources/${resourceId}`)
        .send({ name: 'Published Title', status: 'inactive' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Published Title');
      expect(response.body.data.status).toBe('inactive');
      expect(response.body.message).toContain('updated successfully');
    });

    it('should update only specified fields', async () => {
      const createResponse = await request(app)
        .post('/api/resources')
        .send({
          name: 'Baseline',
          description: 'Keep this',
          category: 'test'
        });

      const resourceId = createResponse.body.data.id;

      const response = await request(app)
        .put(`/api/resources/${resourceId}`)
        .send({ name: 'Renamed Only' });

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('Renamed Only');
      expect(response.body.data.description).toBe('Keep this');
      expect(response.body.data.category).toBe('test');
    });

    it('should return 404 for non-existent resource', async () => {
      const response = await request(app)
        .put('/api/resources/999999')
        .send({ name: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 if no fields provided for update', async () => {
      const createResponse = await request(app)
        .post('/api/resources')
        .send({ name: 'Placeholder' });

      const resourceId = createResponse.body.data.id;

      const response = await request(app)
        .put(`/api/resources/${resourceId}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('At least one field');
    });
  });

  describe('DELETE /api/resources/:id - Delete Resource', () => {
    it('should delete a resource successfully', async () => {
      const createResponse = await request(app)
        .post('/api/resources')
        .send({ name: 'Temporary Item' });

      const resourceId = createResponse.body.data.id;

      const deleteResponse = await request(app).delete(`/api/resources/${resourceId}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.success).toBe(true);
      expect(deleteResponse.body.message).toContain('deleted successfully');

      const getResponse = await request(app).get(`/api/resources/${resourceId}`);
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 when deleting non-existent resource', async () => {
      const response = await request(app).delete('/api/resources/999999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app).delete('/api/resources/invalid-id');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('API Response Format', () => {
    it('should return consistent success response format', async () => {
      const response = await request(app)
        .post('/api/resources')
        .send({ name: 'Format Check' });

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message');
      expect(typeof response.body.success).toBe('boolean');
    });

    it('should return consistent error response format', async () => {
      const response = await request(app).post('/api/resources').send({});

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('error');
      expect(response.body.success).toBe(false);
      expect(typeof response.body.error).toBe('string');
    });
  });
});
