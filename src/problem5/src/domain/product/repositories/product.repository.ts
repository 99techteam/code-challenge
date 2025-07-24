import type { Product } from '@/domain/product/entities/product.entity';
import type { PaginationParams } from '@/shared/types/pagination';

/**
 * Interface for Product Repository
 * Defines all operations allowed on Product aggregate root
 */
export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findAll(params: PaginationParams): Promise<Product[]>;
  findAllWithCount(params: PaginationParams): Promise<{ products: Product[]; total: number }>;
  save(product: Product): Promise<void>;
  update(product: Product): Promise<void>;
  delete(id: string): Promise<void>;
}
