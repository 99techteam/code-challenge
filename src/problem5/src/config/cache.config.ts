/****
 * Default TTL (Time-To-Live) for Redis cache in seconds.
 */
import { env } from '@/config/env.config';

export const CACHE_TTL = env.CACHE_TTL; // 1 hour default

/**
 * Prefix used for product cache keys.
 */
export const PRODUCT_CACHE_PREFIX = 'product';
