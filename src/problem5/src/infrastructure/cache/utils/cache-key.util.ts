import { PRODUCT_CACHE_PREFIX } from '@/config/cache.config';

export function buildProductCacheKey(id: string): string {
  return `${PRODUCT_CACHE_PREFIX}_${id}`;
}
