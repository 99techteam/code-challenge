import { z } from "zod";

export const SearchUserRequestZSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
});

export type SearchUserRequest = z.infer<typeof SearchUserRequestZSchema>;
