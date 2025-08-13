import z from "zod";

export const findResourceByIdSchema = z.object({
	id: z.coerce.number().int().min(0),
});

export type FindResourceByIdDto = z.infer<typeof findResourceByIdSchema>;
