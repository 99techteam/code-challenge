import { z } from 'zod';

// Enum for resource status
export const ResourceStatusEnum = z.enum(['active', 'inactive', 'archived']);

// Base resource schema
export const ResourceSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().min(1, 'Name is required').max(255, 'Name must not exceed 255 characters'),
  description: z.string().max(1000, 'Description must not exceed 1000 characters').optional(),
  category: z.string().max(100, 'Category must not exceed 100 characters').optional(),
  status: ResourceStatusEnum.default('active'),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

// Schema for creating a resource (strict - no extra fields allowed)
export const CreateResourceSchema = z.object({
  name: z.string()
    .min(1, 'Name is required and must be a non-empty string')
    .max(255, 'Name must not exceed 255 characters')
    .trim(),
  description: z.string()
    .max(1000, 'Description must not exceed 1000 characters')
    .trim()
    .optional(),
  category: z.string()
    .max(100, 'Category must not exceed 100 characters')
    .trim()
    .optional(),
  status: ResourceStatusEnum.optional().default('active'),
}).strict(); // Reject any extra fields

// Schema for updating a resource (all fields optional but at least one required)
export const UpdateResourceSchema = z.object({
  name: z.string()
    .min(1, 'Name must be a non-empty string')
    .max(255, 'Name must not exceed 255 characters')
    .trim()
    .optional(),
  description: z.string()
    .max(1000, 'Description must not exceed 1000 characters')
    .trim()
    .optional()
    .nullable(), // Allow null to clear description
  category: z.string()
    .max(100, 'Category must not exceed 100 characters')
    .trim()
    .optional()
    .nullable(), // Allow null to clear category
  status: ResourceStatusEnum.optional(),
}).strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided for update' }
  );

// Schema for resource ID parameter
export const ResourceIdSchema = z.object({
  id: z.string()
    .regex(/^\d+$/, 'Invalid resource ID')
    .transform(Number)
    .pipe(z.number().int().positive()),
});

// Schema for query filters
export const ResourceFiltersSchema = z.object({
  name: z.string().optional(),
  category: z.string().optional(),
  status: ResourceStatusEnum.optional(),
  limit: z.string()
    .regex(/^\d+$/, 'Limit must be a positive number')
    .transform(Number)
    .pipe(z.number().int().positive().max(100, 'Limit cannot exceed 100'))
    .optional(),
  offset: z.string()
    .regex(/^\d+$/, 'Offset must be a non-negative number')
    .transform(Number)
    .pipe(z.number().int().nonnegative())
    .optional(),
}).strict();

// Type inference from schemas
export type Resource = z.infer<typeof ResourceSchema>;
export type CreateResourceDTO = z.infer<typeof CreateResourceSchema>;
export type UpdateResourceDTO = z.infer<typeof UpdateResourceSchema>;
export type ResourceFilters = z.infer<typeof ResourceFiltersSchema>;
export type ResourceStatus = z.infer<typeof ResourceStatusEnum>;
