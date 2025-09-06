import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { Paginated } from '@problem5/shared'

import {
  CreateProduct,
  IProductRepository,
  IProductService,
  ListProducts,
  Product,
  ProductPaginationRequest,
  UpdateProduct,
} from '../../domain'
import { PRODUCT_REPOSITORY } from '../../infras'

@Injectable()
export class ProductService implements IProductService {
  constructor(@Inject(PRODUCT_REPOSITORY) private readonly productRepository: IProductRepository) {}

  async createProduct(data: CreateProduct): Promise<Product> {
    try {
      // Check for duplicate SKU - findBySku now throws NotFoundException if not found
      try {
        await this.productRepository.findBySku(data.sku)
        // If we reach here, product with SKU exists
        throw new ConflictException(`Product with SKU '${data.sku}' already exists`)
      } catch (checkError) {
        if (checkError instanceof ConflictException) {
          throw checkError
        }
        // NotFoundException means SKU is available, continue with creation
      }

      await this.productRepository.create(data)
      // Fetch the created product to return it
      return await this.productRepository.findBySku(data.sku)
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error
      }
      throw new BadRequestException('Failed to create product')
    }
  }

  async getProduct(productId: number): Promise<Product> {
    // Repository now throws NotFoundException directly, no need to check for null
    return await this.productRepository.findById(productId)
  }

  async getProducts(params: ListProducts, pagination: ProductPaginationRequest): Promise<Paginated<Product>> {
    return await this.productRepository.findAll(params, pagination)
  }

  async updateProduct(productId: number, data: UpdateProduct): Promise<Product> {
    // Verify product exists
    await this.getProduct(productId)

    // Check for duplicate SKU if updating SKU
    if (data.sku) {
      try {
        const existingProduct = await this.productRepository.findBySku(data.sku)
        if (existingProduct.id !== productId) {
          throw new ConflictException(`Product with SKU '${data.sku}' already exists`)
        }
      } catch (checkError) {
        // NotFoundException means SKU is available, continue with update
        if (!(checkError instanceof NotFoundException)) {
          throw checkError
        }
      }
    }

    try {
      await this.productRepository.update(productId, data)
      // Fetch the updated product to return it
      return await this.productRepository.findById(productId)
    } catch {
      throw new BadRequestException('Failed to update product')
    }
  }

  async deleteProduct(productId: number): Promise<void> {
    // Verify product exists
    await this.getProduct(productId)

    try {
      await this.productRepository.delete(productId)
    } catch {
      throw new BadRequestException('Failed to delete product')
    }
  }
}
