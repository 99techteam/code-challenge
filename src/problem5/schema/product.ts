import { z } from 'zod';
import { isValidULID } from '../types/branded';

export const productIdParam = z.object({
  id: z.string().refine(isValidULID, 'ID must be a valid ULID'),
});

const metadataSchema = z
  .record(z.unknown())
  .refine(
    (val) => Object.keys(val).length <= 20,
    { message: 'Metadata must have at most 20 keys' }
  )
  .optional()
  .default({});

export const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().max(5000).optional().default(''),
  price: z.number().positive('Price must be positive'),
  category: z.string().min(1, 'Category is required').max(100),
  sku: z.string().min(1, 'SKU is required').max(50).regex(/^[A-Z0-9-]+$/, 'SKU must be uppercase alphanumeric with hyphens'),
  isActive: z.boolean().optional().default(true),
  metadata: metadataSchema,
});

export const updateProductSchema = createProductSchema.partial().refine(
  (val) => Object.keys(val).length > 0,
  { message: 'At least one field must be provided for update' }
);

export const listProductsSchema = z.object({
  category: z.string().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
