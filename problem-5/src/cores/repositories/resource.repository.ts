import { getModelForClass } from "@typegoose/typegoose";
import { ResourceEntity } from "../entities/resource.entity";

class ResourceRepository {
  private model = getModelForClass(ResourceEntity);

  async create(input: Partial<ResourceEntity>) {
    return this.model.create({
      ...input
    });
  }

  async findById(id: string) {
    return this.model.findById(id);
  }

  async findAll(filter: { name?: string } = {}) {
    const query: any = {};
    if (filter.name) {
      query.name = { $regex: filter.name, $options: "i" };
    }
    return this.model.find(query);
  }

  async updateById(id: string, update: Partial<ResourceEntity>) {
    return this.model.findByIdAndUpdate(id, update, { new: true });
  }

  async deleteById(id: string) {
    return this.model.findByIdAndDelete(id);
  }
}

export const resourceRepository = new ResourceRepository();
