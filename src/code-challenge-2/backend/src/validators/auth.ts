import { z } from 'zod';

export const registerSchema = z.object({
  email:    z.string().email(),
  name:     z.string().min(1).max(100),
  password: z.string().min(6).max(100),
});

export const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});
