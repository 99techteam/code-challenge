import { Paginated } from '@problem5/shared'

import { CreateProduct, ListProducts, Product, ProductPaginationRequest, UpdateProduct } from '../entities'

export interface IProductRepository {
  create(data: CreateProduct): Promise<void>
  findById(productId: number): Promise<Product>
  findBySku(sku: string): Promise<Product>
  findAll(params: ListProducts, pagination: ProductPaginationRequest): Promise<Paginated<Product>>
  update(productId: number, data: UpdateProduct): Promise<void>
  delete(productId: number): Promise<void>
}
