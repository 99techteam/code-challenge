import { ResourceRepository } from './resource.repository';
import { CreateResourceDto, UpdateResourceDto, ResourceFilters } from './resource.dto';
import { AppError } from '../../common/middleware/error.middleware';
import { HttpStatus } from '../../common/constants/httpStatus';

export const ResourceService = {
  async getAll(filters: ResourceFilters) {
    return ResourceRepository.findAll(filters);
  },

  async getById(id: number) {
    const resource = await ResourceRepository.findById(id);
    if (!resource) throw new AppError(HttpStatus.NOT_FOUND, 'Resource not found');
    return resource;
  },

  async create(dto: CreateResourceDto) {
    return ResourceRepository.create(dto);
  },

  async update(id: number, dto: UpdateResourceDto) {
    await ResourceService.getById(id); // throws 404 if not found
    const updated = await ResourceRepository.update(id, dto);
    return updated!;
  },

  async delete(id: number) {
    const deleted = await ResourceRepository.delete(id);
    if (!deleted) throw new AppError(HttpStatus.NOT_FOUND, 'Resource not found');
  },
};
