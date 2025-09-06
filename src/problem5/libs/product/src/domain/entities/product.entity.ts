import { createPaginationSchema } from '@problem5/shared'

import { z } from 'zod'

// Product-specific pagination schema
export const ProductPaginationSchema = createPaginationSchema().extend({
  sort: z.enum(['name', 'price', 'createdAt']).default('createdAt').optional(),
  order: z.enum(['asc', 'desc']).default('desc').optional(),
})

export type ProductPaginationRequest = z.infer<typeof ProductPaginationSchema>

// Enums
export enum ProductCategory {
  ELECTRONICS = 'electronics',
  CLOTHING = 'clothing',
  BOOKS = 'books',
  HOME = 'home',
  SPORTS = 'sports',
}

export const ProductSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(255),
  description: z.string().nullable().optional(),
  price: z.number().positive(), // Number for monetary values
  sku: z.string().min(1).max(100),
  category: z.enum(ProductCategory),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const CreateProductSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().nullable().optional(),
  price: z.number().positive(),
  sku: z.string().min(1).max(100),
  category: z.enum(ProductCategory),
  isActive: z.boolean().default(true),
})

export const UpdateProductSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
  price: z.number().positive().optional(),
  sku: z.string().min(1).max(100).optional(),
  category: z.enum(ProductCategory).optional(),
  isActive: z.boolean().optional(),
})

export const ListProductsSchema = z.object({
  category: z.enum(ProductCategory).optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
  priceMin: z.coerce.number().positive().optional(),
  priceMax: z.coerce.number().positive().optional(),
})

// Type exports
export type Product = z.infer<typeof ProductSchema>
export type CreateProduct = z.infer<typeof CreateProductSchema>
export type UpdateProduct = z.infer<typeof UpdateProductSchema>
export type ListProducts = z.infer<typeof ListProductsSchema>
