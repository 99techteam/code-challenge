import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma, Product as PrismaProduct } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { DatabaseService } from '@problem5/database'
import { createPaginationResponse, Paginated } from '@problem5/shared'

import {
  CreateProduct,
  IProductRepository,
  ListProducts,
  Product,
  ProductPaginationRequest,
  ProductSchema,
  UpdateProduct,
} from '../../domain'

type ProductPrisma = PrismaProduct

@Injectable()
export class ProductPrismaRepository implements IProductRepository {
  constructor(private readonly database: DatabaseService) {}

  async create(data: CreateProduct): Promise<void> {
    await this.database.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: new Decimal(data.price),
        sku: data.sku,
        category: data.category,
        isActive: data.isActive,
      },
    })
  }

  async findById(productId: number): Promise<Product> {
    try {
      const productData = await this.database.product.findUnique({
        where: { id: productId },
      })
      if (!productData) {
        throw new NotFoundException(`Product with ID '${productId}' not found`)
      }
      return this.toProductEntity(productData)
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new NotFoundException(`Product with ID '${productId}' not found`)
    }
  }

  async findBySku(sku: string): Promise<Product> {
    try {
      const productData = await this.database.product.findUnique({
        where: { sku },
      })
      if (!productData) {
        throw new NotFoundException(`Product with SKU '${sku}' not found`)
      }
      return this.toProductEntity(productData)
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new NotFoundException(`Product with SKU '${sku}' not found`)
    }
  }

  async findAll(params: ListProducts, pagination: ProductPaginationRequest): Promise<Paginated<Product>> {
    const { category, isActive, search, priceMin, priceMax } = params

    // Get sorting from pagination instead of params
    const { page, limit, sort = 'createdAt', order = 'desc' } = pagination
    const skip = (page - 1) * limit

    const where: Prisma.ProductWhereInput = {
      ...(category !== undefined && { category }),
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(priceMin !== undefined &&
        priceMax !== undefined && {
          price: { gte: new Decimal(priceMin), lte: new Decimal(priceMax) },
        }),
      ...(priceMin !== undefined &&
        priceMax === undefined && {
          price: { gte: new Decimal(priceMin) },
        }),
      ...(priceMin === undefined &&
        priceMax !== undefined && {
          price: { lte: new Decimal(priceMax) },
        }),
    }

    const [productsData, total] = await Promise.all([
      this.database.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
      }),
      this.database.product.count({ where }),
    ])

    return {
      data: productsData.map((data) => this.toProductEntity(data)),
      paging: createPaginationResponse(total, page, limit),
    }
  }

  async update(productId: number, data: UpdateProduct): Promise<void> {
    try {
      await this.database.product.update({
        where: { id: productId },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.price !== undefined && { price: new Decimal(data.price) }),
          ...(data.sku !== undefined && { sku: data.sku }),
          ...(data.category !== undefined && { category: data.category }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
        },
      })
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Product with ID '${productId}' not found`)
      }
      throw error
    }
  }

  async delete(productId: number): Promise<void> {
    try {
      await this.database.product.delete({
        where: { id: productId },
      })
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Product with ID '${productId}' not found`)
      }
      throw error
    }
  }

  // Private mapping method following DepositPrismaRepository pattern
  private toProductEntity(data: ProductPrisma): Product {
    return ProductSchema.parse({
      id: data.id,
      name: data.name,
      description: data.description,
      price: Number(data.price), // Convert Decimal to number
      sku: data.sku,
      category: data.category,
      isActive: data.isActive,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    })
  }
}
