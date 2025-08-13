import z from "zod";

export const updateResourceSchema = z.object({
	name: z.string().optional(),
	description: z.string().optional(),
});

export type UpdateResourceDto = z.infer<typeof updateResourceSchema>;
