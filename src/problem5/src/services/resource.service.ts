import { Repository } from 'typeorm';
import { ResourceEntity } from '../entities';
import { AppDataSource } from '../databases';

export class ResourceService {
  private getRepository(): Repository<ResourceEntity> {
    if (!AppDataSource.isInitialized) {
      throw new Error('DataSource is not initialized, cannot get repository.');
    }
    return AppDataSource.getRepository(ResourceEntity);
  }

  async createResource(data: Partial<ResourceEntity>): Promise<ResourceEntity> {
    const resource = this.getRepository().create(data);
    return await this.getRepository().save(resource);
  }

  async getResources(filter: any): Promise<ResourceEntity[]> {
    return await this.getRepository().find({ where: filter });
  }

  async getResourceById(id: number): Promise<ResourceEntity | null> {
    return await this.getRepository().findOneBy({ id });
  }

  async updateResource(id: number, data: Partial<ResourceEntity>): Promise<ResourceEntity | null> {
    const result = await this.getRepository().update(id, data);
    if (result.affected === 0) {
      return null;
    }
    return this.getResourceById(id);
  }

  async deleteResource(id: number): Promise<{ affected?: number | null }> {
    return await this.getRepository().delete(id);
  }
}
