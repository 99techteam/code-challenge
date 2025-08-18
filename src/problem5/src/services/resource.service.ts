import { Op, WhereOptions } from 'sequelize';
import {
  CreateResourceRequest,
  UpdateResourceRequest,
  ResourceQueryParams,
  PaginatedResponse,
} from '../types';
import { notFound, conflict, databaseError, badRequest } from '../errors';

import { Resource, ResourceAttributes } from '../models';

// Type for Sequelize where conditions
type ResourceWhereConditions = WhereOptions<ResourceAttributes>;

// Type for update data
type ResourceUpdateData = Partial<
  Pick<
    ResourceAttributes,
    'name' | 'description' | 'category' | 'status' | 'metadata'
  >
>;

export class ResourceService {
  async createResource(data: CreateResourceRequest): Promise<Resource> {
    try {
      return await Resource.create({
        name: data.name,
        description: data.description,
        category: data.category,
        status: data.status || 'active',
        metadata: data.metadata || {},
      });
    } catch (error: unknown) {
      const err = error as Error;
      if (err.name === 'SequelizeUniqueConstraintError') {
        throw conflict('Resource with this name already exists');
      }
      throw databaseError('Failed to create resource', err);
    }
  }

  async getResources(
    params: ResourceQueryParams
  ): Promise<PaginatedResponse<Resource>> {
    const { page = 1, limit = 10, search, category, status } = params;
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions: ResourceWhereConditions = {};

    if (search) {
      whereConditions.name = {
        [Op.iLike]: `%${search}%`,
      };
    }

    if (category) {
      whereConditions.category = category;
    }

    if (status) {
      whereConditions.status = status;
    }

    const { count, rows } = await Resource.findAndCountAll({
      where: whereConditions,
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    const totalPages = Math.ceil(count / limit);

    return {
      data: rows,
      pagination: {
        page,
        limit,
        total: count,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
    };
  }

  async getResourceById(id: number): Promise<Resource> {
    const resource = await Resource.findByPk(id);

    if (!resource) {
      throw notFound('Resource not found');
    }

    return resource;
  }

  async updateResource(
    id: number,
    data: UpdateResourceRequest
  ): Promise<Resource> {
    const resource = await Resource.findByPk(id);

    if (!resource) {
      throw notFound('Resource not found');
    }

    const updateData: ResourceUpdateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.metadata !== undefined) updateData.metadata = data.metadata;

    if (Object.keys(updateData).length === 0) {
      throw badRequest('No fields to update');
    }

    try {
      await resource.update(updateData);
      return resource;
    } catch (error: unknown) {
      const err = error as Error;
      if (err.name === 'SequelizeUniqueConstraintError') {
        throw conflict('Resource with this name already exists');
      }
      throw err;
    }
  }

  async deleteResource(id: number): Promise<void> {
    const resource = await Resource.findByPk(id);

    if (!resource) {
      throw notFound('Resource not found');
    }

    await resource.destroy();
  }
}
