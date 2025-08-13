import z from "zod";

export const createResourceSchema = z.object({
	name: z.string(),
	description: z.string(),
});

export type CreateResourceDto = z.infer<typeof createResourceSchema>;
