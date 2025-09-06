import { Paginated } from '@problem5/shared'

import { CreateProduct, ListProducts, Product, ProductPaginationRequest, UpdateProduct } from '../entities'

export interface IProductService {
  createProduct(data: CreateProduct): Promise<Product>
  getProduct(productId: number): Promise<Product>
  getProducts(params: ListProducts, pagination: ProductPaginationRequest): Promise<Paginated<Product>>
  updateProduct(productId: number, data: UpdateProduct): Promise<Product>
  deleteProduct(productId: number): Promise<void>
}
