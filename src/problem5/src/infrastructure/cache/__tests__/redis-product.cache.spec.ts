const mockRedis = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
};

jest.mock('../redis.client', () => {
  return {
    RedisCache: jest.fn().mockImplementation(() => mockRedis),
  };
});

import { ProductCache } from '../redis-product.cache';
import { buildProductCacheKey } from '../utils/cache-key.util';

import { Product } from '@/domain/product/entities/product.entity';
import { CACHE_TTL } from '@/config/cache.config';

// Mock logger
jest.mock('@/infrastructure/logging/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('ProductCache', () => {
  const mockProduct = new Product({
    id: 'p123',
    name: 'Laptop',
    description: 'Gaming',
    price: 1999,
    stock: 10,
    category: 'Tech',
    isActive: true,
    tags: ['gamer', 'tech'],
    images: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const cache = new ProductCache(mockRedis as any);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should cache product successfully', async () => {
    const product = mockProduct;
    const expectedCacheKey = buildProductCacheKey(product.id);
    const expectedCacheValue = JSON.stringify(product.toJSON());
    await cache.set(product);

    expect(mockRedis.set).toHaveBeenCalledWith(expectedCacheKey, expectedCacheValue, CACHE_TTL);
  });

  it('should return null if product not in cache', async () => {
    mockRedis.get.mockResolvedValue(null);

    const result = await cache.get('p123');
    expect(result).toBeNull();
    expect(mockRedis.get).toHaveBeenCalledWith(buildProductCacheKey('p123'));
  });

  it('should parse product from cache', async () => {
    const jsonStr = JSON.stringify(mockProduct.toJSON());
    const expectedKey = buildProductCacheKey('p123');
    mockRedis.get.mockResolvedValueOnce(jsonStr);

    const result = await cache.get('p123');

    expect(mockRedis.get).toHaveBeenCalledWith(expectedKey);
    expect(result).not.toBeNull();
    expect(result).toBeInstanceOf(Product);
    expect(result?.id).toBe(mockProduct.id);
    expect(result?.name).toBe(mockProduct.name);
    expect(result?.description).toBe(mockProduct.description);
    expect(result?.price).toBe(mockProduct.price);
    expect(result?.stock).toBe(mockProduct.stock);
    expect(result?.category).toBe(mockProduct.category);
    expect(result?.isActive).toBe(mockProduct.isActive);
  });

  it('should delete product from cache', async () => {
    await cache.del('p123');
    expect(mockRedis.delete).toHaveBeenCalledWith(buildProductCacheKey('p123'));
  });
});
