import { Resource } from "@opentelemetry/resources";
import { NotFoundException } from "../../exceptions/not-found.exception";
import { ResourceController } from "./resource.controller";
import { ResourceEntity } from "./resource.entity";
import type { ResourceService } from "./resource.service";
import type { Response, Request } from "express";

// @ts-ignore
const mockService: ResourceService = {
  find: vi.fn(),
  findOne: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
  restore: vi.fn(),
};

const mockResponse = {
  json: vi.fn(),
} as unknown as Response;

describe("ResourceController", () => {
  let controller: ResourceController;

  beforeEach(() => {
    controller = new ResourceController(mockService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("get resource by id", () => {
    it("should call service.findOne", async () => {
      const id = 1;
      vi.spyOn(mockService, "findOne").mockResolvedValue({} as any);
      await controller.getResource(
        { params: { id } } as unknown as Request,
        mockResponse,
      );
      expect(mockService.findOne).toHaveBeenCalledWith(id);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it("should throw when resource is not found", async () => {
      const id = 1;
      vi.spyOn(mockService, "findOne").mockRejectedValue(
        new NotFoundException(),
      );
      await expect(
        controller.getResource(
          { params: { id } } as unknown as Request,
          mockResponse,
        ),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe("update resource", () => {
    it("should call service.update", async () => {
      const id = 1;
      const dto = {};
      vi.spyOn(mockService, "update").mockResolvedValue({} as ResourceEntity);
      await controller.updateResource(
        { params: { id }, body: dto } as unknown as Request,
        mockResponse,
      );
      expect(mockService.update).toHaveBeenCalledWith(id, dto);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it("should pass even no value is passed", async () => {
      const id = 1;
      const dto = {};
      vi.spyOn(mockService, "update").mockResolvedValue({} as ResourceEntity);
      await controller.updateResource(
        { params: { id }, body: dto } as unknown as Request,
        mockResponse,
      );
      expect(mockService.update).toHaveBeenCalledWith(id, dto);
      expect(mockResponse.json).toHaveBeenCalled();
    });
    it("should throw when resource is not found", async () => {
      const id = 1;
      const dto = {};
      vi.spyOn(mockService, "update").mockRejectedValue(
        new NotFoundException(),
      );
      await expect(
        controller.updateResource(
          { params: { id }, body: dto } as unknown as Request,
          mockResponse,
        ),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe("create resource", () => {
    it("should call service.create", async () => {
      const dto = {};
      vi.spyOn(mockService, "create").mockResolvedValue({} as ResourceEntity);
      await controller.createResource(
        { body: dto } as unknown as Request,
        mockResponse,
      );
      expect(mockService.create).toHaveBeenCalledWith(dto);
      expect(mockResponse.json).toHaveBeenCalled();
    });
  });

  describe("delete resource", () => {
    it("should call service.softDelete", async () => {
      const id = 1;
      vi.spyOn(mockService, "softDelete").mockResolvedValue(
        {} as ResourceEntity,
      );
      await controller.softDelete(
        { params: { id } } as unknown as Request,
        mockResponse,
      );
      expect(mockService.softDelete).toHaveBeenCalledWith(id);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it("should throw when resource is not found", async () => {
      const id = 1;
      vi.spyOn(mockService, "softDelete").mockRejectedValue(
        new NotFoundException(),
      );
      await expect(
        controller.softDelete(
          { params: { id } } as unknown as Request,
          mockResponse,
        ),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe("restore resource", () => {
    it("should call service.restore", async () => {
      const id = 1;
      vi.spyOn(mockService, "restore").mockResolvedValue({} as ResourceEntity);
      await controller.restore(
        { params: { id } } as unknown as Request,
        mockResponse,
      );
      expect(mockService.restore).toHaveBeenCalledWith(id);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it("should throw when resource is not found", async () => {
      const id = 1;
      vi.spyOn(mockService, "restore").mockRejectedValue(
        new NotFoundException(),
      );
      await expect(
        controller.restore(
          { params: { id } } as unknown as Request,
          mockResponse,
        ),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
