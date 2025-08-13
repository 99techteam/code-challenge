import { NotFoundException } from "../../exceptions/not-found.exception";
import type { CreateResourceDto } from "./dto/create-resource.dto";
import type { FindResourcesDto } from "./dto/find-resources.dto";
import type { ResourceRepository } from "./repositories/resource.repository";
import type { ResourceEntity } from "./resource.entity";
import { ResourceService } from "./resource.service";

const mockRepository: ResourceRepository = {
	find: vi.fn(),
	findOne: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
	softDelete: vi.fn(),
	restore: vi.fn(),
};
describe("ResourceService", () => {
	let service: ResourceService;

	beforeEach(() => {
		service = new ResourceService(mockRepository);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	describe("find", () => {
		it("should call repository.find", () => {
			const dto: FindResourcesDto = {
				filter: {},
				pagination: {},
				sort: {},
				select: ["id", "name"],
			};
			service.find(dto);
			expect(mockRepository.find).toHaveBeenCalledWith(dto);
		});
	});

	describe("findOne", () => {
		it("should call repository.findOne", async () => {
			const id = 1;
			vi.spyOn(mockRepository, "findOne").mockResolvedValue(
				{} as ResourceEntity,
			);
			const result = await service.findOne(id);
			expect(mockRepository.findOne).toHaveBeenCalledWith(id);
			expect(result).toBeDefined();
		});
		it("should throw when resource is not found", async () => {
			const id = 1;
			vi.spyOn(mockRepository, "findOne").mockImplementation(() => {
				return Promise.resolve(null);
			});
			await expect(() => service.findOne(id)).rejects.toThrow(
				new NotFoundException("Resource not found"),
			);
		});
	});

	describe("create", () => {
		it("should call repository.create", async () => {
			const dto: CreateResourceDto = {
				name: "test",
				description: "test",
			};
			vi.spyOn(mockRepository, "create").mockResolvedValue(
				{} as ResourceEntity,
			);
			const result = await service.create(dto);
			expect(mockRepository.create).toHaveBeenCalledWith(dto);
			expect(result).toBeDefined();
		});
	});

	describe("update", () => {
		it("should call repository.update", async () => {
			const id = 1;
			const dto: CreateResourceDto = {
				name: "test",
				description: "test",
			};
			vi.spyOn(mockRepository, "findOne").mockResolvedValue(
				{} as ResourceEntity,
			);
			vi.spyOn(mockRepository, "update").mockResolvedValue(
				{} as ResourceEntity,
			);
			const result = await service.update(id, dto);
			expect(mockRepository.update).toHaveBeenCalledWith(id, dto);
			expect(result).toBeDefined();
		});

		it("should throw when resource is not found", async () => {
			const id = 1;
			const dto: CreateResourceDto = {
				name: "test",
				description: "test",
			};
			vi.spyOn(mockRepository, "findOne").mockImplementation(() => {
				return Promise.resolve(null);
			});
			await expect(() => service.update(id, dto)).rejects.toBeInstanceOf(
				NotFoundException,
			);
		});
	});

	describe("softDelete", () => {
		it("should call repository.softDelete", async () => {
			const id = 1;
			vi.spyOn(mockRepository, "findOne").mockResolvedValue(
				{} as ResourceEntity,
			);
			vi.spyOn(mockRepository, "softDelete").mockResolvedValue(
				{} as ResourceEntity,
			);
			const result = await service.softDelete(id);
			expect(mockRepository.softDelete).toHaveBeenCalledWith(id);
			expect(result).toBeDefined();
		});

		it("should throw when resource is not found", async () => {
			const id = 1;
			vi.spyOn(mockRepository, "findOne").mockImplementation(() => {
				return Promise.resolve(null);
			});
			await expect(() => service.softDelete(id)).rejects.toBeInstanceOf(
				NotFoundException,
			);
		});
	});

	describe("restore", () => {
		it("should call repository.restore", async () => {
			const id = 1;
			vi.spyOn(mockRepository, "findOne").mockResolvedValue(
				{} as ResourceEntity,
			);
			vi.spyOn(mockRepository, "restore").mockResolvedValue(
				{} as ResourceEntity,
			);
			const result = await service.restore(id);
			expect(mockRepository.restore).toHaveBeenCalledWith(id);
			expect(result).toBeDefined();
		});

		it("should throw when resource is not found", async () => {
			const id = 1;
			vi.spyOn(mockRepository, "findOne").mockImplementation(() => {
				return Promise.resolve(null);
			});
			await expect(() => service.restore(id)).rejects.toBeInstanceOf(
				NotFoundException,
			);
		});
	});
});
