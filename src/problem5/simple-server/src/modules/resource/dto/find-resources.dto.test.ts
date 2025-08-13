import { findResourcesSchema } from "./find-resources.dto";

describe("findResourcesSchema", () => {
	describe("it validates when data is valid", () => {
		it("should return valid data", () => {
			const dto = {
				filter: "{}",
				pagination: "{}",
				sort: "{}",
				select: "id,name",
			};
			const result = findResourcesSchema.safeParse(dto);

			expect(result.success).toBe(true);
		});
		it("should pass even all properties are missing", () => {
			const dto = {};
			const result = findResourcesSchema.safeParse(dto);
			expect(result.success).toBe(true);
		});
	});

	describe("it throws when data is invalid", () => {
		it("should throw when pagination is invalid", () => {
			const dto = {
				select: [],
				pagination: JSON.stringify({
					page: -1,
					limit: -1,
				}),
			};
			const result = findResourcesSchema.safeParse(dto);
			expect(result.success).toBe(false);
		});

		it("should throw when select is invalid", () => {
			const dto1 = {
				select: "[name]",
			};
			const result = findResourcesSchema.safeParse(dto1);
			expect(result.success).toBe(false);

			const dto2 = {
				select: "name,not_exist",
			};
			const result2 = findResourcesSchema.safeParse(dto2);
			expect(result2.success).toBe(false);
		});

		it("should throw when sort is invalid", () => {
			const dto1 = JSON.stringify({
				sort: {
					field: "not_exist",
					order: "asc",
				},
			});
			const result = findResourcesSchema.safeParse(dto1);
			expect(result.success).toBe(false);

			const dto2 = JSON.stringify({
				sort: {
					field: "name",
					order: "not_exist",
				},
			});
			const result2 = findResourcesSchema.safeParse(dto2);
			expect(result2.success).toBe(false);
		});

		it("should throw when filter is invalid", () => {
			const dto = JSON.stringify({
				filter: {
					name: 1,
				},
			});
			const result = findResourcesSchema.safeParse(dto);
			expect(result.success).toBe(false);
		});
	});
});
