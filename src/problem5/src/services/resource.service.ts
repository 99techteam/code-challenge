import {
  CreateResourceDto,
  FindManyQuery,
  UpdateResourceDto,
} from '../dtos/resource.dto'
import { Resource, ResourceStatus } from '../entities/resource.entity'
import { NotFoundError } from '../errors/HttpError'
import {
  FindManyOptions,
  PaginatedResult,
  ResourceRepository,
} from '../repositories/resource.repository'
import { logger } from '../utils/logger'

export type { CreateResourceDto, FindManyQuery, UpdateResourceDto }

export class ResourceNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`Resource with id ${id} not found`)
  }
}

export class ResourceService {
  constructor(private readonly resourceRepository: ResourceRepository) {}

  async create(dto: CreateResourceDto): Promise<Resource> {
    const resource = await this.resourceRepository.create({
      name: dto.name,
      status: dto.status ?? ResourceStatus.ACTIVE,
    })
    logger.info({ id: resource.id, name: resource.name }, 'Resource created')
    return resource
  }

  async findById(id: string): Promise<Resource> {
    const resource = await this.resourceRepository.findById(id)
    if (!resource) {
      logger.warn({ id }, 'Resource not found')
      throw new ResourceNotFoundError(id)
    }
    return resource
  }

  async findMany(query: FindManyQuery): Promise<PaginatedResult<Resource>> {
    const options: FindManyOptions = {
      pagination: {
        page: query.page ?? 1,
        limit: Math.min(query.limit ?? 20, 100),
      },
      status: query.status,
    }
    return this.resourceRepository.findMany(options)
  }

  async update(id: string, dto: UpdateResourceDto): Promise<Resource> {
    await this.findById(id)
    const updated = await this.resourceRepository.update(id, dto)
    logger.info({ id }, 'Resource updated')
    return updated!
  }

  async delete(id: string): Promise<void> {
    await this.findById(id)
    await this.resourceRepository.delete(id)
    logger.info({ id }, 'Resource deleted')
  }
}
