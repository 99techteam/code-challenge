import { DataSource, Repository } from 'typeorm'
import { Resource, ResourceStatus } from '../entities/resource.entity'

export interface PaginationOptions {
  page: number
  limit: number
}

export interface FindManyOptions {
  pagination: PaginationOptions
  status?: ResourceStatus
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export class ResourceRepository {
  private readonly repo: Repository<Resource>

  constructor(dataSource: DataSource) {
    this.repo = dataSource.getRepository(Resource)
  }

  async create(data: Pick<Resource, 'name' | 'status'>): Promise<Resource> {
    const resource = this.repo.create(data)
    return this.repo.save(resource)
  }

  async findById(id: string): Promise<Resource | null> {
    return this.repo.findOneBy({ id })
  }

  async findMany({
    pagination,
    status,
  }: FindManyOptions): Promise<PaginatedResult<Resource>> {
    const { page, limit } = pagination

    const qb = this.repo.createQueryBuilder('resource')

    if (status) {
      qb.where('resource.status = :status', { status })
    }

    const [data, total] = await qb
      .orderBy('resource.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()

    return { data, total, page, limit }
  }

  async update(
    id: string,
    data: Partial<Pick<Resource, 'name' | 'status'>>,
  ): Promise<Resource | null> {
    const resource = await this.findById(id)
    if (!resource) return null

    Object.assign(resource, data)
    return this.repo.save(resource)
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repo.delete(id)
    return (result.affected ?? 0) > 0
  }
}
