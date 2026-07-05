import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { ProductController } from '../../controller/product-controller';
import { ProductService } from '../../service/product-service';
import { IProductRepository } from '../../repository/interfaces';
import { errorHandler } from '../../middleware/error-handler';
import { validate } from '../../middleware/validate';
import { productIdParam, createProductSchema, updateProductSchema, listProductsSchema } from '../../schema/product';
import { Product } from '../../model/product';

describe('ProductController Integration', () => {
  let app: express.Express;
  let mockRepository: IProductRepository;
  let service: ProductService;
  let controller: ProductController;

  const mockProduct: Product = {
    id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    name: 'Widget',
    description: 'A useful widget',
    price: 29.99,
    category: 'gadgets',
    sku: 'WDG-001',
    isActive: true,
    metadata: {},
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    mockRepository = {
      create: vi.fn().mockResolvedValue(mockProduct),
      findById: vi.fn().mockResolvedValue(mockProduct),
      findBySku: vi.fn().mockResolvedValue(null),
      findBySkuForUpdate: vi.fn().mockResolvedValue(null),
      findAll: vi.fn().mockResolvedValue({ products: [mockProduct], total: 1 }),
      updateProduct: vi.fn().mockResolvedValue({ ...mockProduct, name: 'Updated' }),
      delete: vi.fn().mockResolvedValue(true),
      transaction: vi.fn().mockImplementation(async (fn) => {
        const mockClient = {};
        return fn(mockClient);
      }),
    };

    service = new ProductService(mockRepository);
    controller = new ProductController(service);

    app = express();
    app.use(express.json({ limit: '10kb' }));
    app.post('/v1/products', validate({ body: createProductSchema }), controller.create);
    app.get('/v1/products', validate({ query: listProductsSchema }), controller.list);
    app.get('/v1/products/:id', validate({ params: productIdParam }), controller.getById);
    app.patch('/v1/products/:id', validate({ params: productIdParam, body: updateProductSchema }), controller.update);
    app.delete('/v1/products/:id', validate({ params: productIdParam }), controller.delete);
    app.use(errorHandler);
  });

  describe('POST /v1/products', () => {
    it('should create a product and return 201', async () => {
      const response = await request(app)
        .post('/v1/products')
        .send({
          name: 'Widget',
          price: 29.99,
          category: 'gadgets',
          sku: 'WDG-001',
        });

      expect(response.status).toBe(201);
      expect(response.body.code).toBe('success');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe('Widget');
      expect(response.body.data.price).toBe(29.99);
      expect(response.body.data).not.toHaveProperty('createdAt');
      expect(response.body.data).not.toHaveProperty('updatedAt');
      expect(response.body.data).not.toHaveProperty('metadata');
    });

    it('should return 400 for invalid input', async () => {
      const response = await request(app)
        .post('/v1/products')
        .send({
          name: '',
          price: -10,
          category: '',
          sku: 'invalid sku',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toHaveProperty('code', 'invalid_input');
      expect(response.body.error).toHaveProperty('message');
    });

    it('should return 409 for duplicate SKU', async () => {
      const error = new Error('Unique constraint violation') as any;
      error.code = '23505';
      mockRepository.create = vi.fn().mockRejectedValue(error);

      const response = await request(app)
        .post('/v1/products')
        .send({ name: 'Product 1', price: 10, category: 'test', sku: 'DUP-001' });

      expect(response.status).toBe(409);
      expect(response.body.error).toHaveProperty('code', 'duplicate_sku');
    });
  });

  describe('GET /v1/products', () => {
    it('should list products with pagination', async () => {
      const response = await request(app)
        .get('/v1/products')
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe('success');
      expect(response.body.data).toHaveLength(1);
      expect(response.body.meta.total).toBe(1);
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(10);
    });

    it('should filter by category', async () => {
      const filteredProduct = { ...mockProduct, category: 'gadgets' };
      mockRepository.findAll = vi.fn().mockResolvedValue({ products: [filteredProduct], total: 1 });

      const response = await request(app)
        .get('/v1/products')
        .query({ category: 'gadgets' });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].category).toBe('gadgets');
    });

    it('should filter by price range', async () => {
      mockRepository.findAll = vi.fn().mockResolvedValue({ products: [], total: 0 });

      const response = await request(app)
        .get('/v1/products')
        .query({ minPrice: 10, maxPrice: 50 });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
    });

    it('should search by name', async () => {
      const searchedProduct = { ...mockProduct, name: 'Widget Pro' };
      mockRepository.findAll = vi.fn().mockResolvedValue({ products: [searchedProduct], total: 1 });

      const response = await request(app)
        .get('/v1/products')
        .query({ search: 'widget' });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Widget Pro');
    });
  });

  describe('GET /v1/products/:id', () => {
    it('should return product by ID', async () => {
      const response = await request(app).get('/v1/products/01ARZ3NDEKTSV4RRFFQ69G5FAV');

      expect(response.status).toBe(200);
      expect(response.body.code).toBe('success');
      expect(response.body.data.id).toBe('01ARZ3NDEKTSV4RRFFQ69G5FAV');
    });

    it('should return 404 for non-existent product', async () => {
      mockRepository.findById = vi.fn().mockResolvedValue(null);

      const response = await request(app).get('/v1/products/01ARZ3NDEKTSV4RRFFQ69G5FZZ');

      expect(response.status).toBe(404);
      expect(response.body.error).toHaveProperty('code', 'not_found');
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app).get('/v1/products/abc');

      expect(response.status).toBe(400);
      expect(response.body.error).toHaveProperty('code', 'invalid_input');
    });
  });

  describe('PATCH /v1/products/:id', () => {
    it('should update product partially', async () => {
      const updatedProduct = { ...mockProduct, name: 'Updated', price: 39.99 };
      mockRepository.updateProduct = vi.fn().mockResolvedValue(updatedProduct);

      const response = await request(app)
        .patch('/v1/products/01ARZ3NDEKTSV4RRFFQ69G5FAV')
        .send({ name: 'Updated', price: 39.99 });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe('success');
      expect(response.body.data.name).toBe('Updated');
      expect(response.body.data.price).toBe(39.99);
    });

    it('should return 404 for non-existent product', async () => {
      mockRepository.updateProduct = vi.fn().mockResolvedValue(null);

      const response = await request(app)
        .patch('/v1/products/01ARZ3NDEKTSV4RRFFQ69G5FZZ')
        .send({ name: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error).toHaveProperty('code', 'not_found');
    });

    it('should return 409 when updating to existing SKU', async () => {
      const existingProduct = { ...mockProduct, id: '01ARZ3NDEKTSV4RRFFQ69G5FBW', sku: 'EXIST-001' };
      mockRepository.findBySkuForUpdate = vi.fn().mockResolvedValue(existingProduct);

      const response = await request(app)
        .patch('/v1/products/01ARZ3NDEKTSV4RRFFQ69G5FAV')
        .send({ sku: 'EXIST-001' });

      expect(response.status).toBe(409);
      expect(response.body.error).toHaveProperty('code', 'duplicate_sku');
    });

    it('should return 400 for empty update body', async () => {
      const response = await request(app)
        .patch('/v1/products/01ARZ3NDEKTSV4RRFFQ69G5FAV')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toHaveProperty('code', 'invalid_input');
    });
  });

  describe('DELETE /v1/products/:id', () => {
    it('should soft delete product and return 204', async () => {
      const response = await request(app).delete('/v1/products/01ARZ3NDEKTSV4RRFFQ69G5FAV');

      expect(response.status).toBe(204);
      expect(mockRepository.delete).toHaveBeenCalledWith('01ARZ3NDEKTSV4RRFFQ69G5FAV');
    });

    it('should return 404 for non-existent product', async () => {
      mockRepository.delete = vi.fn().mockResolvedValue(false);

      const response = await request(app).delete('/v1/products/01ARZ3NDEKTSV4RRFFQ69G5FZZ');

      expect(response.status).toBe(404);
      expect(response.body.error).toHaveProperty('code', 'not_found');
    });
  });
});
