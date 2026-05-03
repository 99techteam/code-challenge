import { z } from "zod";

export const bookStatusSchema = z.enum(["available", "borrowed", "archived"]);

export const createBookSchema = z.object({
  title: z.string().trim().min(1, "title is required"),
  author: z.string().trim().min(1, "author is required"),
  status: bookStatusSchema.default("available"),
  publishedYear: z.number().int().min(0).max(9999).optional(),
});

export const updateBookSchema = createBookSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "at least one field is required",
);

export const listBookQuerySchema = z.object({
  status: bookStatusSchema.optional(),
  author: z.string().trim().optional(),
  q: z.string().trim().optional(),
});

