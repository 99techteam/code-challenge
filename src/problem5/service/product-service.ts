import { IProductRepository } from '../repository/interfaces';
import { IProductService } from './interfaces';
import { Product, CreateProductInput, UpdateProductInput, ProductFilter } from '../model/product';
import { NotFoundError, ConflictError } from '../model/errors';
import { isUniqueConstraintError } from '../repository/db-errors';

export class ProductService implements IProductService {
  constructor(private readonly repository: IProductRepository) {}

  async create(input: CreateProductInput): Promise<Product> {
    try {
      return await this.repository.create(input);
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictError('Product with this SKU already exists', 'duplicate_sku');
      }
      throw error;
    }
  }

  async getById(id: string): Promise<Product> {
    const product = await this.repository.findById(id);
    if (!product) {
      throw new NotFoundError('Product', id);
    }
    return product;
  }

  async list(filter: ProductFilter): Promise<{ products: Product[]; total: number }> {
    return this.repository.findAll(filter);
  }

  async update(id: string, input: UpdateProductInput): Promise<Product> {
    try {
      return await this.repository.transaction(async (client) => {
        if (input.sku) {
          const existingWithSku = await this.repository.findBySkuForUpdate(input.sku, client);
          if (existingWithSku && existingWithSku.id !== id) {
            throw new ConflictError('Product with this SKU already exists', 'duplicate_sku');
          }
        }

        const updated = await this.repository.updateProduct(id, input, client);
        if (!updated) {
          throw new NotFoundError('Product', id);
        }
        return updated;
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictError('Product with this SKU already exists', 'duplicate_sku');
      }
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new NotFoundError('Product', id);
    }
  }
}
