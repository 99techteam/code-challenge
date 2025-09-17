import { z } from 'zod';

// Request validation schemas
export const createItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().optional(),
  price: z.number().min(0, 'Price must be non-negative').default(0),
});

export const updateItemSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  category: z.string().optional().nullable(),
  price: z.number().min(0, 'Price must be non-negative').optional(),
});

export const getItemsQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(['createdAt', 'price', 'name']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export const itemParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// TypeScript types
export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type GetItemsQuery = z.infer<typeof getItemsQuerySchema>;
export type ItemParams = z.infer<typeof itemParamsSchema>;

export interface ItemResponse {
  id: number;
  name: string;
  category: string | null;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ItemListResponse {
  items: ItemResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}