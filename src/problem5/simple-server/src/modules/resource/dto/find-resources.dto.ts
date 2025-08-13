import z from "zod";

const fields = z.union([
	z.literal("id"),
	z.literal("name"),
	z.literal("description"),
	z.literal("createdAt"),
	z.literal("updatedAt"),
	z.literal("deletedAt"),
]);
const filterObject = z.object({
	name: z.string().optional(),
	description: z.string().optional(),
});

const paginationObject = z.object({
	page: z.coerce.number().int().min(1).optional(),
	limit: z.coerce.number().int().min(1).optional(),
});

const sortObject = z.object({
	field: fields.optional(),
	order: z.enum(["asc", "desc"]).optional(),
});

function preprocessObject(value: unknown) {
	if (typeof value === "string") {
		try {
			const parsed = JSON.parse(value);
			return parsed;
		} catch {
			return {};
		}
	}
	return {};
}

function preprocessArray(value: unknown) {
	if (typeof value === "string") {
		return value.length > 0 ? value.split(",") : [];
	}
	return [];
}

export const findResourcesSchema = z.object({
	filter: z.preprocess(preprocessObject, filterObject.optional()),
	pagination: z.preprocess(preprocessObject, paginationObject.optional()),
	sort: z.preprocess(preprocessObject, sortObject.optional()),
	select: z.preprocess(preprocessArray, z.array(fields)),
});

export type FindResourcesDto = z.infer<typeof findResourcesSchema>;
