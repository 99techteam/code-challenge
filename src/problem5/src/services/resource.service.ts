import { Prisma } from "@prisma/client";
import { prisma } from "../config/database";
import { Resource } from "../types";

export interface ResourceFilters {
  name?: string;
  limit?: number;
  offset?: number;
}

export class ResourceService {
  async create(name: string): Promise<Resource> {
    return await prisma.resource.create({
      data: { name },
    });
  }

  async findAll(
    filters: ResourceFilters = {}
  ): Promise<{ resources: Resource[]; total: number }> {
    const { name, limit = 10, offset = 0 } = filters;

    const where: Prisma.ResourceWhereInput = {};

    if (name) {
      where.name = {
        contains: name,
        mode: "insensitive",
      };
    }

    const [resources, total] = await Promise.all([
      prisma.resource.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
      }),
      prisma.resource.count({ where }),
    ]);

    return { resources, total };
  }

  async findById(id: string): Promise<Resource | null> {
    return await prisma.resource.findUnique({
      where: { id },
    });
  }

  async update(id: string, name: string): Promise<Resource | null> {
    try {
      return await prisma.resource.update({
        where: { id },
        data: { name },
      });
    } catch (error) {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.resource.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}
