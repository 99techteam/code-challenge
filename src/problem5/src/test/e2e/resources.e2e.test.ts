import request from 'supertest';
import { testDataSource } from '../e2e-setup';
import { Resource } from '../../entities/Resource.entity';

// Import the main app instead of creating a separate one
// This ensures we use the same middleware, error handlers, etc.
import app from '../../server';

describe('Resources E2E Tests', () => {
  let resourceRepository: any;

  beforeAll(async () => {
    resourceRepository = testDataSource.getRepository(Resource);
  });

  describe('POST /api/resources - Create Resource', () => {
    it('should create a new resource with valid data', async () => {
      const newResource = {
        name: 'Test Resource',
        description: 'This is a test resource',
        category: 'Testing',
        isActive: true
      };

      const response = await request(app)
        .post('/api/resources')
        .send(newResource)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        message: 'Resource created successfully',
        data: expect.objectContaining({
          id: expect.any(Number),
          name: newResource.name,
          description: newResource.description,
          category: newResource.category,
          isActive: newResource.isActive,
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        })
      });
    });

    it('should create resource with minimal required fields', async () => {
      const newResource = {
        name: 'Minimal Resource',
        description: 'Minimal description'
      };

      const response = await request(app)
        .post('/api/resources')
        .send(newResource)
        .expect(201);

      expect(response.body.data).toEqual(expect.objectContaining({
        name: newResource.name,
        description: newResource.description,
        category: null,
        isActive: true // default value
      }));
    });

    it('should return 400 for missing required fields', async () => {
      const invalidResource = {
        name: 'Missing Description'
      };

      const response = await request(app)
        .post('/api/resources')
        .send(invalidResource)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("Validation failed");
    });

    it('should return 400 for invalid data types', async () => {
      const invalidResource = {
        name: 123, // should be string
        description: 'Valid description',
        isActive: 'invalid' // should be boolean
      };

      const response = await request(app)
        .post('/api/resources')
        .send(invalidResource)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for empty name', async () => {
      const invalidResource = {
        name: '',
        description: 'Valid description'
      };

      const response = await request(app)
        .post('/api/resources')
        .send(invalidResource)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/resources/:id - Get Resource by ID', () => {
    let createdResource: any;

    beforeEach(async () => {
      const resource = resourceRepository.create({
        name: 'Test Resource',
        description: 'Test description',
        category: 'Testing',
        isActive: true
      });
      createdResource = await resourceRepository.save(resource);
    });

    it('should get resource by valid ID', async () => {
      const response = await request(app)
        .get(`/api/resources/${createdResource.id}`)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          id: createdResource.id,
          name: createdResource.name,
          description: createdResource.description,
          category: createdResource.category,
          isActive: createdResource.isActive
        })
      });
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .get('/api/resources/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid resource ID');
    });

    it('should return 404 for non-existent ID', async () => {
      const response = await request(app)
        .get('/api/resources/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Resource not found');
    });
  });

  describe('GET /api/resources - Get All Resources', () => {
    beforeEach(async () => {
      // Create test data
      const resources = [
        { name: 'Resource 1', description: 'Description 1', category: 'Category A', isActive: true },
        { name: 'Resource 2', description: 'Description 2', category: 'Category B', isActive: false },
        { name: 'Resource 3', description: 'Description 3', category: 'Category A', isActive: true },
        { name: 'Test Resource', description: 'Test Description', category: 'Testing', isActive: true }
      ];

      for (const resourceData of resources) {
        const resource = resourceRepository.create(resourceData);
        await resourceRepository.save(resource);
      }
    });

    it('should get all resources without filters', async () => {
      const response = await request(app)
        .get('/api/resources')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data).toHaveLength(4);
      expect(response.body.data.total).toBe(4);
    });

    it('should filter resources by name', async () => {
      const response = await request(app)
        .get('/api/resources?name=Test')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data).toHaveLength(1);
      expect(response.body.data.data[0].name).toContain('Test');
    });

    it('should filter resources by category', async () => {
      const response = await request(app)
        .get('/api/resources?category=Category A')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data).toHaveLength(2);
      expect(response.body.data.data.every((r: any) => r.category === 'Category A')).toBe(true);
    });

    it('should filter resources by isActive', async () => {
      const response = await request(app)
        .get('/api/resources?isActive=false')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data).toHaveLength(1);
      expect(response.body.data.data[0].isActive).toBe(false);
    });

    it('should handle pagination with limit and offset', async () => {
      const response = await request(app)
        .get('/api/resources?limit=2&offset=1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data).toHaveLength(2);
      expect(response.body.data.limit).toBe(2);
      expect(response.body.data.offset).toBe(1);
    });

    it('should return empty array for no matches', async () => {
      const response = await request(app)
        .get('/api/resources?name=NonExistent')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data).toHaveLength(0);
      expect(response.body.data.total).toBe(0);
    });
  });

  describe('GET /api/resources/categories - Get Categories', () => {
    beforeEach(async () => {
      const resources = [
        { name: 'Resource 1', description: 'Description 1', category: 'Development', isActive: true },
        { name: 'Resource 2', description: 'Description 2', category: 'Testing', isActive: true },
        { name: 'Resource 3', description: 'Description 3', category: 'Development', isActive: true },
        { name: 'Resource 4', description: 'Description 4', category: 'Production', isActive: true }
      ];

      for (const resourceData of resources) {
        const resource = resourceRepository.create(resourceData);
        await resourceRepository.save(resource);
      }
    });

    it('should get all unique categories', async () => {
      const response = await request(app)
        .get('/api/resources/categories')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(
        expect.arrayContaining(['Development', 'Testing', 'Production'])
      );
      expect(response.body.data).toHaveLength(3);
    });
  });

  describe('PUT /api/resources/:id - Update Resource (Full)', () => {
    let createdResource: any;

    beforeEach(async () => {
      const resource = resourceRepository.create({
        name: 'Original Resource',
        description: 'Original description',
        category: 'Original',
        isActive: true
      });
      createdResource = await resourceRepository.save(resource);
    });

    it('should update resource with valid data', async () => {
      const updateData = {
        name: 'Updated Resource',
        description: 'Updated description',
        category: 'Updated',
        isActive: false
      };

      const response = await request(app)
        .put(`/api/resources/${createdResource.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Resource updated successfully',
        data: expect.objectContaining(updateData)
      });
    });

    it('should return 404 for non-existent resource', async () => {
      const updateData = {
        name: 'Updated Resource',
        description: 'Updated description'
      };

      const response = await request(app)
        .put('/api/resources/99999')
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid update data', async () => {
      const invalidData = {
        name: '',
        description: 'Valid description'
      };

      const response = await request(app)
        .put(`/api/resources/${createdResource.id}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/resources/:id - Update Resource (Partial)', () => {
    let createdResource: any;

    beforeEach(async () => {
      const resource = resourceRepository.create({
        name: 'Original Resource',
        description: 'Original description',
        category: 'Original',
        isActive: true
      });
      createdResource = await resourceRepository.save(resource);
    });

    it('should update only provided fields', async () => {
      const partialUpdate = {
        name: 'Partially Updated',
        isActive: false
      };

      const response = await request(app)
        .patch(`/api/resources/${createdResource.id}`)
        .send(partialUpdate)
        .expect(200);

      expect(response.body.data).toEqual(expect.objectContaining({
        name: partialUpdate.name,
        isActive: partialUpdate.isActive,
        description: createdResource.description, // unchanged
        category: createdResource.category // unchanged
      }));
    });

    it('should update single field', async () => {
      const partialUpdate = { isActive: false };

      const response = await request(app)
        .patch(`/api/resources/${createdResource.id}`)
        .send(partialUpdate)
        .expect(200);

      expect(response.body.data.isActive).toBe(false);
      expect(response.body.data.name).toBe(createdResource.name);
    });
  });

  describe('DELETE /api/resources/:id - Delete Resource', () => {
    let createdResource: any;

    beforeEach(async () => {
      const resource = resourceRepository.create({
        name: 'Resource to Delete',
        description: 'This will be deleted',
        category: 'Delete',
        isActive: true
      });
      createdResource = await resourceRepository.save(resource);
    });

    it('should delete existing resource', async () => {
      const response = await request(app)
        .delete(`/api/resources/${createdResource.id}`)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Resource deleted successfully',
        data: { deleted: true }
      });

      // Verify resource is actually deleted
      const deletedResource = await resourceRepository.findOne({
        where: { id: createdResource.id }
      });
      expect(deletedResource).toBeNull();
    });

    it('should return 404 for non-existent resource', async () => {
      const response = await request(app)
        .delete('/api/resources/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .delete('/api/resources/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/resources')
        .send('{ invalid json }')
        .set('Content-Type', 'application/json')
        .expect(500); // JSON parsing errors return 500

      expect(response.body.success).toBe(false);
    });

    it('should accept form data successfully', async () => {
      const response = await request(app)
        .post('/api/resources')
        .send('name=Form Test Resource&description=Created from form data')
        .expect(201); // API successfully processes form data

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Form Test Resource');
    });
  });

  describe('Integration Tests - Complex Scenarios', () => {
    it('should handle complete CRUD lifecycle', async () => {
      // Create
      const createResponse = await request(app)
        .post('/api/resources')
        .send({
          name: 'Lifecycle Test Resource',
          description: 'Testing complete lifecycle',
          category: 'Integration',
          isActive: true
        });

      expect(createResponse.status).toBe(201);
      const resourceId = createResponse.body.data.id;

      // Read
      const readResponse = await request(app)
        .get(`/api/resources/${resourceId}`);
      
      expect(readResponse.status).toBe(200);
      expect(readResponse.body.data.name).toBe('Lifecycle Test Resource');

      // Update
      const updateResponse = await request(app)
        .put(`/api/resources/${resourceId}`)
        .send({
          name: 'Updated Lifecycle Resource',
          description: 'Updated description',
          category: 'Updated Integration',
          isActive: false
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.data.name).toBe('Updated Lifecycle Resource');

      // Delete
      const deleteResponse = await request(app)
        .delete(`/api/resources/${resourceId}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.data.deleted).toBe(true);

      // Verify deletion
      const verifyResponse = await request(app)
        .get(`/api/resources/${resourceId}`);
      
      expect(verifyResponse.status).toBe(404);
    });
  });
}); 