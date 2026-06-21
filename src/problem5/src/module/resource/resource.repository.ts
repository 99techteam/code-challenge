import { prisma } from "../../lib/prisma.js";

export interface ResourceFilters {
  name?: string | undefined;
  description?: string | undefined;
}

export class ResourceRepository {
  async findAll(filters?: ResourceFilters) {
    const where: any = {};

    if (filters?.name) {
      where.name = { contains: filters.name };
    }

    if (filters?.description) {
      where.description = { contains: filters.description };
    }

    return await prisma.resource.findMany({
      where
    });
  }

  async findById(id: number) {
    return await prisma.resource.findUnique({
      where: { id },
    });
  }

  async create(data: { name: string; description: string }) {
    return await prisma.resource.create({ data });
  }

  async update(id: number, data: { name?: string; description?: string }) {
    return await prisma.resource.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return await prisma.resource.delete({
      where: { id },
    });
  }
  
}