import type { PrismaClient } from '@prisma/client';

import type { ProductRepository } from '@/domain/product/repositories/product.repository';
import { Product } from '@/domain/product/entities/product.entity';
import type { ProductCache } from '@/infrastructure/cache/redis-product.cache';
import { logger } from '@/infrastructure/logging/logger';
import type { PaginationParams } from '@/shared/types/pagination';
import { DatabaseError } from '@/shared/errors/database.error';

/**
 * Prisma implementation of ProductRepository with Redis caching
 */
export class PrismaProductRepository implements ProductRepository {
  private readonly prisma: PrismaClient;
  private readonly cache: ProductCache;

  constructor(prisma: PrismaClient, cache: ProductCache) {
    this.prisma = prisma;
    this.cache = cache;
  }

  async findById(id: string): Promise<Product | null> {
    logger.info(`Looking up product with id=${id}`);
    try {
      try {
        const cached = await this.cache.get(id);
        if (cached) return cached;
      } catch (cacheErr) {
        logger.warn(`Redis cache get failed for product id=${id}`, cacheErr);
      }

      const record = await this.prisma.product.findUnique({ where: { id } });
      if (!record) {
        logger.warn(`Product with id=${id} not found in database`);
        return null;
      }

      const product = this.toDomain(record);

      try {
        await this.cache.set(product);
      } catch (cacheErr) {
        logger.warn(`Redis cache set failed for product id=${id}`, cacheErr);
      }

      return product;
    } catch (error) {
      logger.error(`Error finding product with id=${id}:`, error);
      throw new DatabaseError('Failed to find product by ID');
    }
  }

  async findAll(params: PaginationParams): Promise<Product[]> {
    const { page, limit } = params;
    logger.info(`Fetching all products, page=${page}, limit=${limit}`);
    try {
      const skip = (page - 1) * limit;

      const records = await this.prisma.product.findMany({
        skip,
        take: limit,
      });
      return records.map(this.toDomain);
    } catch (error) {
      logger.error(`Error fetching all products, page=${page}, limit=${limit}:`, error);
      throw new DatabaseError('Failed to fetch products');
    }
  }

  async findAllWithCount(
    params: PaginationParams,
  ): Promise<{ products: Product[]; total: number }> {
    const { page, limit } = params;
    logger.info(`Fetching all products with count, page=${page}, limit=${limit}`);
    try {
      const skip = (page - 1) * limit;

      const [records, total] = await this.prisma.$transaction([
        this.prisma.product.findMany({
          skip,
          take: limit,
        }),
        this.prisma.product.count(),
      ]);
      const products = records.map(this.toDomain);
      return { products, total };
    } catch (error) {
      logger.error(`Error fetching all products with count, page=${page}, limit=${limit}:`, error);
      throw new DatabaseError('Failed to fetch products with count');
    }
  }

  async save(product: Product): Promise<void> {
    logger.info(`Saving new product with id=${product.id}`);
    try {
      await this.prisma.product.create({
        data: this.toPersistence(product),
      });

      try {
        await this.cache.set(product);
      } catch (cacheErr) {
        logger.warn(`Redis cache set failed for product id=${product.id}`, cacheErr);
      }
    } catch (error) {
      logger.error(`Error saving product with id=${product.id}:`, error);
      throw new DatabaseError('Failed to save product');
    }
  }

  async update(product: Product): Promise<void> {
    logger.info(`Updating product with id=${product.id}`);
    try {
      await this.prisma.product.update({
        where: { id: product.id },
        data: this.toPersistence(product),
      });

      try {
        await this.cache.set(product);
      } catch (cacheErr) {
        logger.warn(`Redis cache update failed for product id=${product.id}`, cacheErr);
      }
    } catch (error) {
      logger.error(`Error updating product with id=${product.id}:`, error);
      throw new DatabaseError('Failed to update product');
    }
  }

  async delete(id: string): Promise<void> {
    logger.info(`Deleting product with id=${id}`);
    try {
      await this.prisma.product.delete({ where: { id } });

      try {
        await this.cache.del(id);
      } catch (cacheErr) {
        logger.warn(`Redis cache delete failed for product id=${id}`, cacheErr);
      }
    } catch (error) {
      logger.error(`Error deleting product with id=${id}:`, error);
      throw new DatabaseError('Failed to delete product');
    }
  }

  // Convert from Prisma DB record to Domain Entity
  private readonly toDomain = (record: any): Product => {
    return new Product({
      id: record.id,
      name: record.name,
      description: record.description,
      price: record.price,
      stock: record.stock,
      category: record.category,
      isActive: record.isActive,
      tags: record.tags,
      images: record.images,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  };

  // Convert from Domain Entity to Prisma format
  private readonly toPersistence = (product: Product) => {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      isActive: product.isActive,
      tags: product.tags,
      images: product.images,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  };
}
