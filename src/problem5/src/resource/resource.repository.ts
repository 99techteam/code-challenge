import { Repository } from "typeorm";
import { ResourceOrmEntity } from "./resource.orm-entity";

export class ResourceRepository {
  constructor(private repo: Repository<ResourceOrmEntity>) {}

  async create(data: {
    name: string;
    description?: string | undefined;
  }) {
    const entity = this.repo.create({
      name: data.name,
      ...(data.description !== undefined && {
        description: data.description,
      }),
    });

    return this.repo.save(entity);
  }

  async update(
    id: string,
    data: {
      name?: string | undefined;
      description?: string | undefined;
    }
  ) {
    const entity = await this.repo.findOneBy({ id });
    if (!entity) return null;

    Object.assign(entity, {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && {
        description: data.description,
      }),
    });

    return this.repo.save(entity);
  }

  async findAll({
    page,
    limit,
    name,
  }: {
    page: number;
    limit: number;
    name?: string;
  }) {
    const qb = this.repo.createQueryBuilder("r");

    if (name) {
      qb.where("r.name LIKE :name", { name: `%${name}%` });
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  findById(id: string) {
    return this.repo.findOneBy({ id });
  }

  delete(id: string) {
    return this.repo.delete(id);
  }
}
