import { z } from "zod";

export const ResourceStatus = z.enum(["active", "inactive", "archived"]);
export type ResourceStatus = z.infer<typeof ResourceStatus>;

export const CreateResourceInput = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional(),
  status: ResourceStatus.optional().default("active"),
});
export type CreateResourceInput = z.infer<typeof CreateResourceInput>;

export const UpdateResourceInput = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(2000).nullable().optional(),
    status: ResourceStatus.optional(),
  })
  .refine((v) => Object.keys(v).length > 0, {
    message: "At least one field must be provided",
  });
export type UpdateResourceInput = z.infer<typeof UpdateResourceInput>;

export const ListResourcesQuery = z.object({
  status: ResourceStatus.optional(),
  q: z.string().trim().min(1).max(200).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
});
export type ListResourcesQuery = z.infer<typeof ListResourcesQuery>;
