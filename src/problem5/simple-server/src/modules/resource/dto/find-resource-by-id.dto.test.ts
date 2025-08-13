import { findResourceByIdSchema } from "./find-resource-by-id.dto";

describe("findResourceByIdSchema", () => {
	describe("it validates when data is valid", () => {
		it("should return valid data", () => {
			const dto = {
				id: 1,
			};
			const result = findResourceByIdSchema.safeParse(dto);
			expect(result.success).toBe(true);
		});
		it("should parse to number", () => {
			const dto = {
				id: "1",
			};
			const result = findResourceByIdSchema.safeParse(dto);
			expect(result.success).toBe(true);
		});
	});

	describe("it throws when data is invalid", () => {
		it("should throw when id is missing", () => {
			const dto = {};
			const result = findResourceByIdSchema.safeParse(dto);
			expect(result.success).toBe(false);
		});
		it("should throw when id is not a number", () => {
			const dto = {
				id: "a",
			};
			const result = findResourceByIdSchema.safeParse(dto);
			expect(result.success).toBe(false);
		});
		it("should throw when id is not a positive number", () => {
			const dto = {
				id: -1,
			};
			const result = findResourceByIdSchema.safeParse(dto);
			expect(result.success).toBe(false);
		});
		it("should throw when id is not an integer", () => {
			const dto = {
				id: 1.1,
			};
			const result = findResourceByIdSchema.safeParse(dto);
			expect(result.success).toBe(false);
		});
		it("should throw when id is a NaN", () => {
			const dto = {
				id: NaN,
			};
			const result = findResourceByIdSchema.safeParse(dto);
			expect(result.success).toBe(false);
		});
	});
});
