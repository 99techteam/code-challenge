import type { CreateProductDTO } from '../dtos/create-product.dto';
import type { UpdateProductDTO } from '../dtos/update-product.dto';

import type { PaginationParams, PaginatedResult } from '@/shared/types/pagination';

export interface IProductUseCase {
  create(dto: CreateProductDTO): Promise<Record<string, unknown>>;
  update(id: string, dto: UpdateProductDTO): Promise<Record<string, unknown>>;
  get(id: string): Promise<Record<string, unknown> | null>;
  getAll(params: PaginationParams): Promise<PaginatedResult<Record<string, unknown>>>;
  delete(id: string): Promise<void>;
}
