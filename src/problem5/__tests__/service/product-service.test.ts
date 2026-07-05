import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProductService } from '../../service/product-service';
import { IProductRepository } from '../../repository/interfaces';
import { NotFoundError, ConflictError } from '../../model/errors';
import { Product } from '../../model/product';

describe('ProductService', () => {
  let service: ProductService;
  let mockRepository: IProductRepository;

  const mockProduct: Product = {
    id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    name: 'Test Product',
    description: 'Test description',
    price: 29.99,
    category: 'test',
    sku: 'TEST-001',
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
  });

  describe('create', () => {
    it('should create a product successfully', async () => {
      const input = {
        name: 'Test Product',
        price: 29.99,
        category: 'test',
        sku: 'TEST-001',
      };

      const result = await service.create(input);

      expect(result).toEqual(mockProduct);
      expect(mockRepository.create).toHaveBeenCalledWith(input);
    });

    it('should throw ConflictError when SKU already exists', async () => {
      const error = new Error('Unique constraint violation') as any;
      error.code = '23505';
      mockRepository.create = vi.fn().mockRejectedValue(error);

      await expect(service.create({ name: 'Test', price: 10, category: 'test', sku: 'TEST-001' }))
        .rejects.toThrow(ConflictError);
    });
  });

  describe('getById', () => {
    it('should return product when it exists', async () => {
      const result = await service.getById('01ARZ3NDEKTSV4RRFFQ69G5FAV');
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundError when product does not exist', async () => {
      mockRepository.findById = vi.fn().mockResolvedValue(null);

      await expect(service.getById('01ARZ3NDEKTSV4RRFFQ69G5FZZ')).rejects.toThrow(NotFoundError);
    });
  });

  describe('list', () => {
    it('should return products with filters', async () => {
      const filter = {
        page: 1,
        limit: 20,
      };

      const result = await service.list(filter);

      expect(result.products).toEqual([mockProduct]);
      expect(result.total).toBe(1);
    });
  });

  describe('update', () => {
    it('should update product successfully', async () => {
      const input = { name: 'Updated' };
      const result = await service.update('01ARZ3NDEKTSV4RRFFQ69G5FAV', input);

      expect(result.name).toBe('Updated');
    });

    it('should throw NotFoundError when product does not exist', async () => {
      mockRepository.updateProduct = vi.fn().mockResolvedValue(null);

      await expect(service.update('01ARZ3NDEKTSV4RRFFQ69G5FZZ', { name: 'Updated' })).rejects.toThrow(NotFoundError);
    });

    it('should throw ConflictError when updating to existing SKU', async () => {
      const existingProduct = { ...mockProduct, id: '01ARZ3NDEKTSV4RRFFQ69G5FBW', sku: 'EXISTING-001' };
      mockRepository.findBySkuForUpdate = vi.fn().mockResolvedValue(existingProduct);

      await expect(service.update('01ARZ3NDEKTSV4RRFFQ69G5FAV', { sku: 'EXISTING-001' })).rejects.toThrow(ConflictError);
    });

    it('should throw ConflictError on unique constraint violation during update', async () => {
      const error = new Error('Unique constraint violation') as any;
      error.code = '23505';
      mockRepository.transaction = vi.fn().mockRejectedValue(error);

      await expect(service.update('01ARZ3NDEKTSV4RRFFQ69G5FAV', { sku: 'NEW-001' }))
        .rejects.toThrow(ConflictError);
    });
  });

  describe('delete', () => {
    it('should delete product successfully', async () => {
      await expect(service.delete('01ARZ3NDEKTSV4RRFFQ69G5FAV')).resolves.not.toThrow();
      expect(mockRepository.delete).toHaveBeenCalledWith('01ARZ3NDEKTSV4RRFFQ69G5FAV');
    });

    it('should throw NotFoundError when product does not exist', async () => {
      mockRepository.delete = vi.fn().mockResolvedValue(false);

      await expect(service.delete('01ARZ3NDEKTSV4RRFFQ69G5FZZ')).rejects.toThrow(NotFoundError);
    });
  });
});
