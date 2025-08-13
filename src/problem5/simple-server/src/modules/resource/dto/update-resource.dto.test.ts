import { updateResourceSchema } from "./update-resource.dto";

describe("updateResourceSchema", () => {
	describe("it validates when data is valid", () => {
		it("should return valid data", () => {
			const dto = {
				name: "Test",
				description: "Test",
			};
			const result = updateResourceSchema.safeParse(dto);
			expect(result.success).toBe(true);
		});
		it("should pass even all properties are missing", () => {
			const dto = {};
			const result = updateResourceSchema.safeParse(dto);
			expect(result.success).toBe(true);
		});

		it("should pass when name is missing", () => {
			const dto = {
				description: "Test",
			};
			const result = updateResourceSchema.safeParse(dto);
			expect(result.success).toBe(true);
		});
	});
});
