import { z } from 'zod';

export const createResourceSchema = z.object({
  name: z.string("Name is required").min(1),
  description: z.string("Description is required").min(1),
});