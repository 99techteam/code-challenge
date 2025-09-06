import { createZodDto } from 'nestjs-zod'

import { CreateProductSchema, ListProductsSchema, ProductPaginationSchema, UpdateProductSchema } from '../../domain'

export class ProductPaginationDTO extends createZodDto(ProductPaginationSchema) {}
export class CreateProductDto extends createZodDto(CreateProductSchema) {}
export class UpdateProductDto extends createZodDto(UpdateProductSchema) {}
export class ListProductsDto extends createZodDto(ListProductsSchema) {}
