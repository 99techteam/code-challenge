import { z } from "zod";

export const IdZSchema = z.object({
  id: z.coerce.number(),
});

export type IdParam = z.infer<typeof IdZSchema>;
