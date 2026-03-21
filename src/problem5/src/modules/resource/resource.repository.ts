import { Like, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { AppDataSource } from '../../config/database';
import { Resource } from './resource.model';
import {
  CreateResourceDto,
  UpdateResourceDto,
  ResourceFilters,
  PaginatedResult,
} from './resource.dto';

const repo = () => AppDataSource.getRepository(Resource);

export const ResourceRepository = {
  async findAll(filters: ResourceFilters): Promise<PaginatedResult<Resource>> {
    const where: Record<string, unknown> = {};

    if (filters.name) where.name = Like(`%${filters.name}%`);

    if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
      where.price = Between(filters.minPrice, filters.maxPrice);
    } else if (filters.minPrice !== undefined) {
      where.price = MoreThanOrEqual(filters.minPrice);
    } else if (filters.maxPrice !== undefined) {
      where.price = LessThanOrEqual(filters.maxPrice);
    }

    const [data, total] = await repo().findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    });

    return {
      data,
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit),
    };
  },

  async findById(id: number): Promise<Resource | null> {
    return repo().findOneBy({ id });
  },

  async create(dto: CreateResourceDto): Promise<Resource> {
    const resource = repo().create(dto);
    return repo().save(resource);
  },

  async update(id: number, dto: UpdateResourceDto): Promise<Resource | null> {
    await repo().update(id, dto);
    return repo().findOneBy({ id });
  },

  async delete(id: number): Promise<boolean> {
    const result = await repo().delete(id);
    return (result.affected ?? 0) > 0;
  },
};
