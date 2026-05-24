import {
  BatchUpdateResourceDto,
  CreateResourceDto,
  ListResourcesQueryDto,
  UpdateResourceDto
} from '../dto/resource.dto';
import { ResourceStatusEnum } from '../enums/resource-status.enum';
import { BadRequestException, NotFoundException } from '../exceptions/http.exception';
import { ListResourceFiltersModel, ResourceModel } from '../models/resource.model';
import { ResourceRepository } from '../repositories/resource.repository';

function parsePositiveInt(value: string): number {
  const num = Number(value);
  if (!Number.isInteger(num) || num <= 0) {
    throw new BadRequestException('id must be a positive integer');
  }
  return num;
}

function parseIds(ids?: number[]): number[] {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new BadRequestException('ids must be a non-empty array');
  }
  const clean = ids.filter((id) => Number.isInteger(id) && id > 0);
  if (clean.length !== ids.length) {
    throw new BadRequestException('all ids must be positive integers');
  }
  return clean;
}

function parseStatus(status?: string): ResourceStatusEnum | undefined {
  if (status === undefined) return undefined;
  if (status !== ResourceStatusEnum.ACTIVE && status !== ResourceStatusEnum.INACTIVE) {
    throw new BadRequestException('status must be active or inactive');
  }
  return status;
}

export class ResourceService {
  constructor(private readonly repository: ResourceRepository = new ResourceRepository()) {}

  async create(dto: CreateResourceDto): Promise<ResourceModel> {
    const name = dto.name?.trim();
    if (!name) {
      throw new BadRequestException('name is required');
    }

    const status = parseStatus(dto.status) ?? ResourceStatusEnum.ACTIVE;
    return this.repository.create({
      name,
      description: dto.description ?? null,
      status
    });
  }

  async list(query: ListResourcesQueryDto): Promise<{ data: ResourceModel[]; count: number }> {
    const status = parseStatus(query.status);
    const filters: ListResourceFiltersModel = {
      status,
      name: query.name,
      limit: Math.min(Math.max(Number(query.limit ?? 20), 1), 100),
      offset: Math.max(Number(query.offset ?? 0), 0)
    };

    return this.repository.list(filters);
  }

  async getById(rawId: string): Promise<ResourceModel> {
    const id = parsePositiveInt(rawId);
    const item = await this.repository.findById(id);
    if (!item) {
      throw new NotFoundException('resource not found');
    }
    return item;
  }

  async updateById(rawId: string, dto: UpdateResourceDto): Promise<ResourceModel> {
    const id = parsePositiveInt(rawId);
    const patch = {
      ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
      ...(dto.description !== undefined ? { description: dto.description } : {}),
      ...(dto.status !== undefined ? { status: parseStatus(dto.status) } : {})
    };

    if (dto.name !== undefined && !dto.name.trim()) {
      throw new BadRequestException('name cannot be empty');
    }

    const hasAnyPatch = Object.keys(patch).length > 0;
    if (!hasAnyPatch) {
      throw new BadRequestException('provide at least one field to update');
    }

    const updated = await this.repository.updateById(id, patch);
    if (!updated) {
      throw new NotFoundException('resource not found');
    }
    return updated;
  }

  async deleteById(rawId: string): Promise<void> {
    const id = parsePositiveInt(rawId);
    const deleted = await this.repository.deleteById(id);
    if (!deleted) {
      throw new NotFoundException('resource not found');
    }
  }

  // hard delete (permanent)
  async hardDeleteById(rawId: string): Promise<void> {
    const id = parsePositiveInt(rawId);
    const deletedIds = await this.repository.hardDeleteById?.(id as any as number) ?? [];
    if (!deletedIds || deletedIds.length === 0) {
      throw new NotFoundException('resource not found');
    }
  }

  async batchUpdate(dto: BatchUpdateResourceDto): Promise<ResourceModel[]> {
    const ids = parseIds(dto.ids);
    const patch = dto.patch;
    if (!patch || Object.keys(patch).length === 0) {
      throw new BadRequestException('patch is required');
    }

    if (patch.name !== undefined && !patch.name.trim()) {
      throw new BadRequestException('name cannot be empty');
    }

    const sanitizedPatch = {
      ...(patch.name !== undefined ? { name: patch.name.trim() } : {}),
      ...(patch.description !== undefined ? { description: patch.description } : {}),
      ...(patch.status !== undefined ? { status: parseStatus(patch.status) } : {})
    };

    if (Object.keys(sanitizedPatch).length === 0) {
      throw new BadRequestException('patch has no valid fields to update');
    }

    return this.repository.batchUpdate(ids, sanitizedPatch);
  }

  async batchDelete(ids?: number[]): Promise<number[]> {
    const cleanIds = parseIds(ids);
    return this.repository.batchDelete(cleanIds);
  }

  async hardBatchDelete(ids?: number[]): Promise<number[]> {
    const cleanIds = parseIds(ids);
    return this.repository.hardDeleteMany(cleanIds);
  }
}
