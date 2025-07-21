import { Request, Response, NextFunction } from 'express';
import { validateCreateItem, validateUpdateItem, validateItemId, validatePagination } from '../src/middlewares/validation';
import request from 'supertest';
import express from 'express';

// Helper function to create a test app with validation middleware
const createTestApp = (validationMiddleware: any[]) => {
  const app = express();
  app.use(express.json());
  
  app.post('/test', ...validationMiddleware, (req: Request, res: Response) => {
    res.status(200).json({ success: true });
  });

  app.get('/test/:id', ...validationMiddleware, (req: Request, res: Response) => {
    res.status(200).json({ success: true });
  });
  
  app.get('/test', ...validationMiddleware, (req: Request, res: Response) => {
    res.status(200).json({ success: true });
  });

  // Error handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    res.status(err.status || 500).json({
      message: err.message,
      errors: err.errors || [],
    });
  });

  return app;
};

describe('Validation Middleware', () => {
  describe('validateCreateItem', () => {
    const app = createTestApp(validateCreateItem);

    it('should pass validation with valid create item data', async () => {
      const validData = {
        name: 'Test Item',
        description: 'Test Description',
        price: 10.99,
        category: 'Test Category',
      };

      const response = await request(app)
        .post('/test')
        .send(validData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
    });

    it('should fail validation when name is missing', async () => {
      const invalidData = {
        description: 'Test Description',
        price: 10.99,
        category: 'Test Category',
      };

      const response = await request(app)
        .post('/test')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('Name is required');
    });

    it('should fail validation when name is empty string', async () => {
      const invalidData = {
        name: '',
        description: 'Test Description',
        price: 10.99,
        category: 'Test Category',
      };

      const response = await request(app)
        .post('/test')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors[0]).toMatch(/Name/);
    });

    it('should fail validation when name is not a string', async () => {
      const invalidData = {
        name: 123,
        description: 'Test Description',
        price: 10.99,
        category: 'Test Category',
      };

      const response = await request(app)
        .post('/test')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation failed');
    });

    it('should fail validation when description is missing', async () => {
      const invalidData = {
        name: 'Test Item',
        price: 10.99,
        category: 'Test Category',
      };

      const response = await request(app)
        .post('/test')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('Description is required');
    });

    it('should fail validation when category is missing', async () => {
      const invalidData = {
        name: 'Test Item',
        description: 'Test Description',
        price: 10.99,
      };

      const response = await request(app)
        .post('/test')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('Category is required');
    });

    it('should fail validation when price is missing', async () => {
      const invalidData = {
        name: 'Test Item',
        description: 'Test Description',
        category: 'Test Category',
      };

      const response = await request(app)
        .post('/test')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('Price is required');
    });

    it('should fail validation when price is negative', async () => {
      const invalidData = {
        name: 'Test Item',
        description: 'Test Description',
        price: -10.99,
        category: 'Test Category',
      };

      const response = await request(app)
        .post('/test')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('Price must be a non-negative number');
    });

    it('should fail validation when price is not a number', async () => {
      const invalidData = {
        name: 'Test Item',
        description: 'Test Description',
        price: 'invalid',
        category: 'Test Category',
      };

      const response = await request(app)
        .post('/test')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('validateUpdateItem', () => {
    const app = createTestApp(validateUpdateItem);

    it('should pass validation with valid update data', async () => {
      const validData = {
        name: 'Updated Item',
        price: 15.99,
      };

      const response = await request(app)
        .post('/test')
        .send(validData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
    });

    it('should pass validation with empty body (all fields optional)', async () => {
      const response = await request(app)
        .post('/test')
        .send({});

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
    });

    it('should pass validation with null values', async () => {
      const validData = {
        description: null,
        category: null,
        price: null,
      };

      const response = await request(app)
        .post('/test')
        .send(validData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
    });

    it('should fail validation when name is empty string', async () => {
      const invalidData = {
        name: '',
      };

      const response = await request(app)
        .post('/test')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors[0]).toMatch(/Name cannot be empty/);
    });

    it('should fail validation when price is negative', async () => {
      const invalidData = {
        price: -5.99,
      };

      const response = await request(app)
        .post('/test')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('Price must be a non-negative number');
    });

    it('should pass validation with only some fields provided', async () => {
      const validData = {
        name: 'Partial Update',
        category: 'Updated Category',
      };

      const response = await request(app)
        .post('/test')
        .send(validData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
    });
  });

  describe('validateItemId', () => {
    const app = createTestApp(validateItemId);

    it('should pass validation with valid positive integer ID', async () => {
      const response = await request(app)
        .get('/test/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
    });

    it('should pass validation with large positive integer ID', async () => {
      const response = await request(app)
        .get('/test/999999');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
    });

    it('should fail validation with zero ID', async () => {
      const response = await request(app)
        .get('/test/0');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('ID must be a positive integer');
    });

    it('should fail validation with negative ID', async () => {
      const response = await request(app)
        .get('/test/-1');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('ID must be a positive integer');
    });

    it('should fail validation with non-numeric ID', async () => {
      const response = await request(app)
        .get('/test/abc');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('ID must be a positive integer');
    });

    it('should fail validation with decimal ID', async () => {
      const response = await request(app)
        .get('/test/1.5');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('ID must be a positive integer');
    });
  });

  describe('validatePagination', () => {
    const app = createTestApp(validatePagination);

    it('should pass validation with valid pagination params', async () => {
      const response = await request(app)
        .get('/test')
        .query({
          page: '1',
          pageSize: '10',
          sortBy: 'name',
          order: 'asc',
          search: 'test',
          category: 'electronics',
          minPrice: '10',
          maxPrice: '100',
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
    });

    it('should pass validation with no query params', async () => {
      const response = await request(app)
        .get('/test');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
    });

    it('should fail validation with zero page', async () => {
      const response = await request(app)
        .get('/test')
        .query({ page: '0' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('Page must be a positive integer');
    });

    it('should fail validation with negative page', async () => {
      const response = await request(app)
        .get('/test')
        .query({ page: '-1' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('Page must be a positive integer');
    });

    it('should fail validation with pageSize over 100', async () => {
      const response = await request(app)
        .get('/test')
        .query({ pageSize: '101' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('PageSize must be a positive integer between 1 and 100');
    });

    it('should fail validation with zero pageSize', async () => {
      const response = await request(app)
        .get('/test')
        .query({ pageSize: '0' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('PageSize must be a positive integer between 1 and 100');
    });

    it('should fail validation with invalid sortBy', async () => {
      const response = await request(app)
        .get('/test')
        .query({ sortBy: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('SortBy must be one of: name, price, category, createdAt');
    });

    it('should fail validation with invalid order', async () => {
      const response = await request(app)
        .get('/test')
        .query({ order: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('Order must be either asc or desc');
    });

    it('should fail validation with negative minPrice', async () => {
      const response = await request(app)
        .get('/test')
        .query({ minPrice: '-10' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('MinPrice must be a non-negative number');
    });

    it('should fail validation with negative maxPrice', async () => {
      const response = await request(app)
        .get('/test')
        .query({ maxPrice: '-50' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('MaxPrice must be a non-negative number');
    });

    it('should fail validation when minPrice is greater than maxPrice', async () => {
      const response = await request(app)
        .get('/test')
        .query({ minPrice: '100', maxPrice: '50' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('MinPrice cannot be greater than MaxPrice');
    });

    it('should pass validation when minPrice equals maxPrice', async () => {
      const response = await request(app)
        .get('/test')
        .query({ minPrice: '50', maxPrice: '50' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
    });

    it('should pass validation with valid price range', async () => {
      const response = await request(app)
        .get('/test')
        .query({ minPrice: '10', maxPrice: '100' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
    });
  });
});