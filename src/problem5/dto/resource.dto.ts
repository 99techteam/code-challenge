import { z } from 'zod';

export const StatusEnum = z.enum(['active', 'inactive']);

export const CreateDTO = z.object({
  name: z.string().trim().min(1, 'name is required'),
  description: z.string().optional(),
  status: StatusEnum.optional(),
});

export const ModifyDTO = z.object({
  name: z.string().trim().min(1, 'name must be a non-empty string').optional(),
  description: z.string().optional(),
  status: StatusEnum.optional(),
});

export const ResourceIdDTO = z.coerce.number().int().positive('id must be a positive integer');

export const ListDTO = z.object({
  name: z.string().optional(),
  status: StatusEnum.optional(),
  page: z.coerce.number().int().min(1).default(1),
  size: z.coerce.number().int().min(1).max(100).default(10),
});
