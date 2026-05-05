import { z } from "zod";

export const userSchema = z.object({
  name: z
    .string()
    .min(1, "name is required")
    .transform((val) => val.trim()),

  email: z
    .string()
    .min(1, "email is required")
    .email("email is invalid")
    .transform((val) => val.trim().toLowerCase()),

  age: z.number().min(0, "age must be >= 0").max(150, "age must be <= 150"),
});

export const updateUserSchema = userSchema.partial();

export const userQuerySchema = z.object({
  page: z.string().optional().transform(Number),
  limit: z.string().optional().transform(Number),
  minAge: z.string().optional().transform(Number),
  maxAge: z.string().optional().transform(Number),
  name: z.string().optional(),
  sort: z.string().optional(),
});
