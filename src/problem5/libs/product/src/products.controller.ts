import { Controller, Delete, Get, Inject, Param, Patch, Post, UseInterceptors } from '@nestjs/common'
import { ApiQuery, ApiTags } from '@nestjs/swagger'
import { SnakeToCamelInterceptor, TransformedBody, TransformedQuery, UseResponseSchema } from '@problem5/shared'

import { z } from 'zod'

import { CreateProductDto, ListProductsDto, ProductPaginationDTO, UpdateProductDto } from './application'
import { IProductService, Product, ProductSchema } from './domain'
import { PRODUCT_SERVICE } from './infras'

@Controller('/products')
@ApiTags('Products')
@UseInterceptors(SnakeToCamelInterceptor)
export class ProductsController {
  constructor(@Inject(PRODUCT_SERVICE) private readonly productService: IProductService) {}

  @Post()
  @UseResponseSchema('Create Product', 'Create a new product', ProductSchema)
  async create(@TransformedBody() createProductDto: CreateProductDto): Promise<Product> {
    return await this.productService.createProduct(createProductDto)
  }

  @Get()
  @UseResponseSchema(
    'List Products',
    'Get list of products with filtering and pagination',
    z.object({
      data: z.array(ProductSchema),
      paging: z.object({
        total: z.number(),
        page: z.number(),
        limit: z.number(),
        pages: z.number(),
      }),
    })
  )
  @ApiQuery({
    name: 'category',
    type: String,
    required: false,
    description: 'Filter products by category (electronics, clothing, books, home, sports)',
    example: 'electronics',
  })
  @ApiQuery({
    name: 'is_active',
    type: Boolean,
    required: false,
    description: 'Filter products by active status',
    example: true,
  })
  @ApiQuery({
    name: 'search',
    type: String,
    required: false,
    description: 'Search products by name, description, or SKU',
    example: 'laptop',
  })
  @ApiQuery({
    name: 'price_min',
    type: Number,
    required: false,
    description: 'Minimum price filter',
    example: 10.0,
  })
  @ApiQuery({
    name: 'price_max',
    type: Number,
    required: false,
    description: 'Maximum price filter',
    example: 100.0,
  })
  @ApiQuery({
    name: 'sort',
    type: String,
    required: false,
    description: 'Sort products by field (name, price, createdAt)',
    example: 'createdAt',
  })
  @ApiQuery({
    name: 'order',
    type: String,
    required: false,
    description: 'Sort order (asc, desc)',
    example: 'desc',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Page number (min: 1, default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Number of items per page (min: 1, max: 100, default: 10)',
    example: 10,
  })
  async findAll(@TransformedQuery() query: ListProductsDto, @TransformedQuery() paginate: ProductPaginationDTO) {
    const result = await this.productService.getProducts(query, paginate)
    return {
      data: result.data,
      paging: result.paging,
    }
  }

  @Get(':productId')
  @UseResponseSchema('Get Product', 'Get product by ID', ProductSchema)
  async findOne(@Param('productId') productId: number): Promise<Product> {
    return await this.productService.getProduct(+productId)
  }

  @Patch(':productId')
  @UseResponseSchema('Update Product', 'Update product by ID', ProductSchema)
  async update(
    @Param('productId') productId: number,
    @TransformedBody() updateProductDto: UpdateProductDto
  ): Promise<Product> {
    return await this.productService.updateProduct(+productId, updateProductDto)
  }

  @Delete(':productId')
  @UseResponseSchema(
    'Delete Product',
    'Delete product by ID',
    z.object({
      success: z.boolean(),
    })
  )
  async remove(@Param('productId') productId: number): Promise<{ success: boolean }> {
    await this.productService.deleteProduct(+productId)
    return { success: true }
  }
}
