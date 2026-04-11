import { z } from 'zod';

const statusEnum = z.enum(['active', 'inactive', 'archived']);

export const createResourceSchema = z.object({
  name: z.string().min(1, 'name is required').max(255),
  description: z.string().max(1000).optional().default(''),
  status: statusEnum.optional().default('active'),
});

export const updateResourceSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  status: statusEnum.optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'at least one field must be provided' }
);

export const listQuerySchema = z.object({
  status: statusEnum.optional(),
  name: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});
