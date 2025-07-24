import type { CreateProductDTO } from '../dtos/create-product.dto';
import type { UpdateProductDTO } from '../dtos/update-product.dto';
import type { IProductUseCase } from '../interfaces/product-service.interface';

import { buildPaginatedResult } from '@/shared/utils/pagination.util';
import type { ProductRepository } from '@/domain/product/repositories/product.repository';
import { Product } from '@/domain/product/entities/product.entity';
import { generateUUID } from '@/shared/utils/uuid.util';
import { logger } from '@/infrastructure/logging/logger';
import type { PaginationParams, PaginatedResult } from '@/shared/types/pagination';
import { DomainError } from '@/shared/errors/domain.error';

/**
 * Use cases for Product operations
 */
export class ProductUseCases implements IProductUseCase {
  private readonly repository: ProductRepository;

  constructor(repository: ProductRepository) {
    this.repository = repository!;
  }

  async getAll(params: PaginationParams): Promise<PaginatedResult<Record<string, unknown>>> {
    const { page, limit } = params;
    logger.info(`Fetching all products with limit=${limit}, page=${page}`);

    const { products, total } = await this.repository.findAllWithCount(params);
    const jsonProducts = products.map((product) => product.toPublicObject());
    return buildPaginatedResult(jsonProducts, total, page, limit);
  }

  async get(id: string): Promise<Record<string, unknown> | null> {
    logger.info(`Fetching product with id=${id}`);
    const product = await this.repository.findById(id);
    return product ? product.toPublicObject() : null;
  }

  async create(dto: CreateProductDTO): Promise<Record<string, unknown>> {
    const product = new Product({
      ...dto,
      id: generateUUID(),
      createdAt: dto.createdAt ?? new Date(),
      updatedAt: dto.updatedAt ?? new Date(),
    });
    logger.info(`Creating product with id=${product.id}`);
    await this.repository.save(product);
    return product.toPublicObject();
  }

  async update(id: string, dto: UpdateProductDTO): Promise<Record<string, unknown>> {
    logger.info(`Updating product with id=${id}`);
    const existing = await this.repository.findById(id);
    if (!existing) {
      logger.warn(`Product with id=${id} not found`);
      throw new DomainError('Product not found');
    }

    const updated = new Product({
      id,
      name: dto.name ?? existing.name,
      description: dto.description ?? existing.description,
      price: dto.price ?? existing.price,
      stock: dto.stock ?? existing.stock,
      category: dto.category ?? existing.category,
      tags: dto.tags ?? existing.tags,
      images: dto.images ?? existing.images,
      isActive: dto.isActive ?? existing.isActive,
      createdAt: existing.createdAt,
      updatedAt: dto.updatedAt ?? new Date(),
    });

    await this.repository.update(updated);
    logger.info(`Product with id=${id} updated successfully`);
    return updated.toPublicObject();
  }

  async delete(id: string): Promise<void> {
    logger.info(`Deleting product with id=${id}`);
    const existing = await this.repository.findById(id);
    if (!existing) {
      logger.warn(`Product with id=${id} not found`);
      throw new DomainError('Product not found');
    }
    await this.repository.delete(id);
    logger.info(`Product with id=${id} deleted`);
  }
}
