import { DataSource, QueryFailedError } from "typeorm";
import { ResourceEntity } from "../entities/resource.entity";
import { ResourceRepository } from "../repositories/resource.repository";
import { CreateResourceInput, IncrementResourceInput, UpdateResourceInput } from "../types/resource";
import { HttpError } from "../utils/http-error";
import { sleep } from "../utils/sleep";

export class ResourceService {
  private readonly repository: ResourceRepository;

  public constructor(private readonly dataSource: DataSource) {
    this.repository = new ResourceRepository(dataSource);
  }

  public async createResource(input: CreateResourceInput): Promise<ResourceEntity> {
    const normalizedCode = ResourceService.normalizeCode(input.code);
    await this.ensureCodeIsAvailable(normalizedCode);

    try {
      const resource = this.repository.create({
        code: normalizedCode,
        name: input.name,
        description: input.description ?? null,
        quantity: input.quantity ?? 0
      });

      return await this.repository.save(resource);
    } catch (error) {
      throw ResourceService.mapPersistenceError(error);
    }
  }

  public listResources(filters: { readonly name?: string; readonly minQuantity?: number }): Promise<ResourceEntity[]> {
    return this.repository.findWithFilters(filters);
  }

  public async getResourceById(id: number): Promise<ResourceEntity> {
    const resource = await this.repository.findById(id);

    if (!resource) {
      throw new HttpError(404, "Resource not found");
    }

    return resource;
  }

  public async updateResource(id: number, input: UpdateResourceInput): Promise<ResourceEntity> {
    const resource = await this.getResourceById(id);
    console.log("🚀 ~ ResourceService ~ updateResource ~ resource:", resource)

    if (input.code !== undefined) {
      const normalizedCode = ResourceService.normalizeCode(input.code);
      await this.ensureCodeIsAvailable(normalizedCode, resource.id);
      resource.code = normalizedCode;
    }

    if (input.name !== undefined) {
      resource.name = input.name;
    }

    if (input.description !== undefined) {
      resource.description = input.description;
    }

    if (input.quantity !== undefined) {
      resource.quantity = input.quantity;
    }

    try {
      return await this.repository.save(resource);
    } catch (error) {
      throw ResourceService.mapPersistenceError(error);
    }
  }

  public async deleteResource(id: number): Promise<void> {
    const resource = await this.getResourceById(id);
    await this.repository.remove(resource);
  }

  public async incrementQuantityWithLock(id: number, input: IncrementResourceInput): Promise<ResourceEntity> {
    return this.dataSource.transaction(async (transactionManager) => {
      const repository = transactionManager.getRepository(ResourceEntity);
      const resource = await repository
        .createQueryBuilder("resource")
        .setLock("pessimistic_write")
        .where("resource.id = :id", { id })
        .getOne();

      if (!resource) {
        throw new HttpError(404, "Resource not found");
      }

      if (input.simulateDelayMs && input.simulateDelayMs > 0) {
        await sleep(input.simulateDelayMs);
      }

      resource.quantity += input.amount;
      return repository.save(resource);
    });
  }

  private static normalizeCode(code: string): string {
    return code.trim().toUpperCase();
  }

  private async ensureCodeIsAvailable(code: string, currentResourceId?: number): Promise<void> {
    const existingResource = await this.repository.findByCode(code);

    if (existingResource && existingResource.id !== currentResourceId) {
      throw new HttpError(409, "Resource code already exists");
    }
  }

  private static mapPersistenceError(error: unknown): Error {
    if (error instanceof QueryFailedError) {
      const driverError = error.driverError as { code?: string } | undefined;
      if (driverError?.code === "23505") {
        return new HttpError(409, "Resource code already exists");
      }
    }

    return error instanceof Error ? error : new Error("Unknown persistence error");
  }
}
