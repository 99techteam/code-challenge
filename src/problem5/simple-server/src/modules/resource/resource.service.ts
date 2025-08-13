import { NotFoundException } from "../../exceptions/not-found.exception";
import type { CreateResourceDto } from "./dto/create-resource.dto";
import type { FindResourcesDto } from "./dto/find-resources.dto";
import type { UpdateResourceDto } from "./dto/update-resource.dto";
import type { ResourceRepository } from "./repositories/resource.repository";
import { ResourceEntity } from "./resource.entity";

export class ResourceService {
  constructor(private readonly repository: ResourceRepository) {}

  find(dto: FindResourcesDto) {
    return this.repository.find(dto);
  }

  async findOne(id: number) {
    const resource = await this.repository.findOne(id);
    if (!resource) throw new NotFoundException("Resource not found");
    return resource;
  }

  create(dto: CreateResourceDto) {
    const newResource = ResourceEntity.create()
      .setName(dto.name)
      .setDescription(dto.description);
    return this.repository.create(newResource);
  }

  async update(id: number, dto: UpdateResourceDto) {
    const resource = await this.repository.findOne(id);
    if (!resource) throw new NotFoundException("Resource not found");
    return this.repository.update(id, dto);
  }

  async softDelete(id: number) {
    const resource = await this.repository.findOne(id);
    if (!resource) throw new NotFoundException("Resource not found");
    return this.repository.softDelete(id);
  }

  async restore(id: number) {
    const resource = await this.repository.findOne(id);
    if (!resource) throw new NotFoundException("Resource not found");
    return this.repository.restore(id);
  }
}
