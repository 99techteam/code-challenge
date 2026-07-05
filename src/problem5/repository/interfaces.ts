import { PoolClient } from 'pg';
import { Product, CreateProductInput, UpdateProductInput, ProductFilter } from '../model/product';

export interface IProductRepository {
  create(input: CreateProductInput): Promise<Product>;
  findById(id: string): Promise<Product | null>;
  findBySku(sku: string): Promise<Product | null>;
  findBySkuForUpdate(sku: string, client: PoolClient): Promise<Product | null>;
  findAll(filter: ProductFilter): Promise<{ products: Product[]; total: number }>;
  updateProduct(id: string, input: UpdateProductInput, client?: PoolClient): Promise<Product | null>;
  delete(id: string): Promise<boolean>;
  transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T>;
}
