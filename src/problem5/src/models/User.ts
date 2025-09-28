import { z } from "zod";

export const UserZSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

export type User = z.infer<typeof UserZSchema>;
