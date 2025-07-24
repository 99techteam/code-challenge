import type { RedisCache } from './redis.client';
import { buildProductCacheKey } from './utils/cache-key.util';

import { Product } from '@/domain/product/entities/product.entity';
import { logger } from '@/infrastructure/logging/logger';
import { CACHE_TTL } from '@/config/cache.config';

class ProductCache {
  private readonly redis: RedisCache;

  constructor(redis: RedisCache) {
    this.redis = redis;
  }

  private buildKey(id: string): string {
    return buildProductCacheKey(id);
  }

  async get(id: string): Promise<Product | null> {
    const key = this.buildKey(id);
    try {
      const cached = await this.redis.get(key);
      if (!cached) {
        logger.debug(`Cache miss for product ${id}`);
        return null;
      }

      const json = JSON.parse(cached);
      const product = Product.fromJSON(json);
      return product;
    } catch (e) {
      logger.warn(`Redis error during get for product ${id}`, e);
      return null;
    }
  }

  async set(product: Product): Promise<void> {
    const key = this.buildKey(product.id);
    try {
      const data = JSON.stringify(product.toJSON());
      await this.redis.set(key, data, CACHE_TTL);
      logger.debug(`Product ${product.id} cached with TTL=${CACHE_TTL}s`);
    } catch (e) {
      logger.error(`Redis error during set for product ${product.id}`, e);
    }
  }

  async del(id: string): Promise<void> {
    const key = this.buildKey(id);
    try {
      await this.redis.delete(key);
      logger.debug(`Product ${id} removed from cache`);
    } catch (e) {
      logger.error(`Redis error during delete for product ${id}`, e);
    }
  }
}

export { ProductCache };
