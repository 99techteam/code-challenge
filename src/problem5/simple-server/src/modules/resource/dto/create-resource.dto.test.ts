import { createResourceSchema } from "./create-resource.dto";

describe("createResourceSchema", () => {
	describe("it validates when data is valid", () => {
		it("should return valid data", () => {
			const dto = {
				name: "Test",
				description: "Test",
			};
			const result = createResourceSchema.safeParse(dto);
			expect(result.success).toBe(true);
		});
	});

	describe("it throws when data is invalid", () => {
		it("should throw when name is missing", () => {
			const dto = {
				description: "Test",
			};
			const result = createResourceSchema.safeParse(dto);
			expect(result.success).toBe(false);
		});

		it("should throw when description is missing", () => {
			const dto = {
				name: "Test",
			};
			const result = createResourceSchema.safeParse(dto);
			expect(result.success).toBe(false);
		});
	});
});
