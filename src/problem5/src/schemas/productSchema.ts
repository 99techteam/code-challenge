import { z } from "zod";

// Zod schema
export const ProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
});

export const ProductWithIdSchema = ProductSchema.extend({
  id: z.number(),
  createdAt: z.string(),
});
