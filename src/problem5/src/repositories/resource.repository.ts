import { DataSource, Repository } from "typeorm";
import { ResourceEntity } from "../entities/resource.entity";

export class ResourceRepository {
  private readonly repository: Repository<ResourceEntity>;

  public constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(ResourceEntity);
  }

  public create(data: Partial<ResourceEntity>): ResourceEntity {
    return this.repository.create(data);
  }

  public save(resource: ResourceEntity): Promise<ResourceEntity> {
    return this.repository.save(resource);
  }

  public findById(id: number): Promise<ResourceEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  public findByCode(code: string): Promise<ResourceEntity | null> {
    return this.repository.findOne({ where: { code } });
  }

  public findWithFilters(filters: { readonly name?: string; readonly minQuantity?: number }): Promise<ResourceEntity[]> {
    const queryBuilder = this.repository.createQueryBuilder("resource");

    if (filters.name) {
      queryBuilder.andWhere("resource.name ILIKE :name", { name: `%${filters.name}%` });
    }

    if (filters.minQuantity !== undefined) {
      queryBuilder.andWhere("resource.quantity >= :minQuantity", { minQuantity: filters.minQuantity });
    }

    return queryBuilder.orderBy("resource.id", "ASC").getMany();
  }

  public remove(resource: ResourceEntity): Promise<ResourceEntity> {
    return this.repository.remove(resource);
  }
}
