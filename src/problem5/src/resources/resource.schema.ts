import { z } from "zod";

/**
 * Single source of truth for resource shape.
 * The DTO schemas (Create / Update / List) are derived from a base schema
 */

export const ResourceStatus = z.enum(["active", "archived", "draft"]);
export type ResourceStatus = z.infer<typeof ResourceStatus>;

const NameSchema = z.string().trim().min(1).max(120);
const CategorySchema = z.string().trim().min(1).max(60);

export const ResourceSchema = z.object({
  id: z.string().uuid(),
  name: NameSchema,
  category: CategorySchema,
  status: ResourceStatus,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Resource = z.infer<typeof ResourceSchema>;

export const CreateResourceSchema = z.object({
  name: NameSchema,
  category: CategorySchema,
  status: ResourceStatus.default("active"),
});
export type CreateResourceInput = z.infer<typeof CreateResourceSchema>;

export const UpdateResourceSchema = z
  .object({
    name: NameSchema.optional(),
    category: CategorySchema.optional(),
    status: ResourceStatus.optional(),
  })
  .refine((v) => Object.keys(v).length > 0, {
    message: "At least one field must be provided",
  });
export type UpdateResourceInput = z.infer<typeof UpdateResourceSchema>;

export const ListResourcesQuerySchema = z.object({
  category: CategorySchema.optional(),
  status: ResourceStatus.optional(),
  q: z.string().trim().min(1).max(120).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  // Opaque base64 cursor — shape validated by the repository layer.
  // Defined here only to bound length and disallow whitespace.
  cursor: z.string().regex(/^[A-Za-z0-9_=-]{1,256}$/).optional(),
});
export type ListResourcesQuery = z.infer<typeof ListResourcesQuerySchema>;

/** UUID path-parameter schema, reused on every `/resources/:id` endpoint. */
export const IdParamSchema = z.object({ id: z.string().uuid() });
