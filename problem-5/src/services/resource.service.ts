import { resourceRepository } from "../cores/repositories/resource.repository";
import { ResourceEntity } from "../cores/entities/resource.entity";

class ResourceService {
  async create(input: Partial<ResourceEntity>) {
    return resourceRepository.create(input);
  }

  async getById(id: string) {
    return resourceRepository.findById(id);
  }

  async getAll(filter: { name?: string } = {}) {
    return resourceRepository.findAll(filter);
  }

  async updateById(id: string, update: Partial<ResourceEntity>) {
    return resourceRepository.updateById(id, update);
  }

  async deleteById(id: string) {
    return resourceRepository.deleteById(id);
  }
}

export const resourceService = new ResourceService();
