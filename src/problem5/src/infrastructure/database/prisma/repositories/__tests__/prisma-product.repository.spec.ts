jest.mock('@/infrastructure/cache/redis-product.cache', () => ({
  ProductCache: jest.fn(() => productCache),
}));

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      product: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    })),
  };
});

import { PrismaClient } from '@prisma/client';

import { PrismaProductRepository } from '../prisma-product.repository';

import { Product } from '@/domain/product/entities/product.entity';

const productCache = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

const mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
const repo = new PrismaProductRepository(mockPrisma, productCache as any);

const mockProduct = new Product({
  id: '1',
  name: 'Test Product',
  description: 'Desc',
  price: 100,
  stock: 10,
  category: 'Test',
  isActive: true,
  tags: [],
  images: [],
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('PrismaProductRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return product from cache', async () => {
    productCache.get.mockResolvedValue(mockProduct);

    const result = await repo.findById('1');

    expect(productCache.get).toHaveBeenCalledWith('1');
    expect(result).toEqual(mockProduct);
  });

  it('should fetch from DB and cache if not in cache', async () => {
    productCache.get.mockResolvedValue(null);
    (mockPrisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct);

    const result = await repo.findById('1');

    expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
    });
    expect(productCache.set).toHaveBeenCalled();
    expect(result?.id).toBe('1');
  });

  it('should return null if product not found in cache or DB', async () => {
    productCache.get.mockResolvedValue(null);
    (mockPrisma.product.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await repo.findById('non-existent-id');

    expect(productCache.get).toHaveBeenCalledWith('non-existent-id');
    expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
      where: { id: 'non-existent-id' },
    });
    expect(result).toBeNull();
  });

  it('should throw error if DB throws in findById', async () => {
    productCache.get.mockResolvedValue(null);
    (mockPrisma.product.findUnique as jest.Mock).mockRejectedValue(new Error('DB failure'));

    await expect(repo.findById('1')).rejects.toThrow('Failed to find product by ID');
    expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
    });
  });

  it('should call Prisma create and cache', async () => {
    (mockPrisma.product.create as jest.Mock).mockResolvedValue(mockProduct);
    await repo.save(mockProduct);
    expect(mockPrisma.product.create).toHaveBeenCalled();
    expect(productCache.set).toHaveBeenCalledWith(mockProduct);
  });

  it('should call Prisma update and update cache', async () => {
    (mockPrisma.product.update as jest.Mock).mockResolvedValue(mockProduct);
    await repo.update(mockProduct);
    expect(mockPrisma.product.update).toHaveBeenCalled();
    expect(productCache.set).toHaveBeenCalledWith(mockProduct);
  });

  it('should call Prisma delete and invalidate cache', async () => {
    (mockPrisma.product.delete as jest.Mock).mockResolvedValue(mockProduct);
    await repo.delete('1');
    expect(mockPrisma.product.delete).toHaveBeenCalledWith({
      where: { id: '1' },
    });
    expect(productCache.del).toHaveBeenCalledWith('1');
  });

  it('should return all products from DB', async () => {
    (mockPrisma.product.findMany as jest.Mock).mockResolvedValue([mockProduct]);

    const result = await repo.findAll({ page: 1, limit: 10 });

    expect(mockPrisma.product.findMany).toHaveBeenCalled();
    expect(result.length).toBe(1);
    expect(result[0]).toBeInstanceOf(Product);
    expect(result[0].id).toBe('1');
  });
});
