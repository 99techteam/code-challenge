import { Product, CreateProductInput, UpdateProductInput, ProductFilter } from '../model/product';

export interface IProductService {
  create(input: CreateProductInput): Promise<Product>;
  getById(id: string): Promise<Product>;
  list(filter: ProductFilter): Promise<{ products: Product[]; total: number }>;
  update(id: string, input: UpdateProductInput): Promise<Product>;
  delete(id: string): Promise<void>;
}
