import { prisma } from '../prisma';
import { ResourceStatusEnum } from '../enums/resource-status.enum';
import { ListResourceFiltersModel, ResourceModel } from '../models/resource.model';

function toDomainStatus(status: string): ResourceStatusEnum {
  return status === ResourceStatusEnum.INACTIVE ? ResourceStatusEnum.INACTIVE : ResourceStatusEnum.ACTIVE;
}

function toDomainModel(input: {
  id: number;
  name: string;
  description: string | null;
  status: string;
  isArchived: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): ResourceModel {
  return {
    id: input.id,
    name: input.name,
    description: input.description,
    status: toDomainStatus(input.status),
    isArchived: input.isArchived,
    deletedAt: input.deletedAt ?? null,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt
  };
}

function toPersistenceStatus(status: ResourceStatusEnum): 'active' | 'inactive' {
  return status === ResourceStatusEnum.INACTIVE ? 'inactive' : 'active';
}

export class ResourceRepository {
  async create(input: { name: string; description: string | null; status: 'active' | 'inactive' }): Promise<ResourceModel> {
    const created = await prisma.resource.create({
      data: {
        name: input.name,
        description: input.description,
        status: input.status
      }
    });

    return toDomainModel({
      ...created,
      isArchived: created.isArchived ?? false,
      deletedAt: created.deletedAt ?? null
    });
  }

  async list(filters: ListResourceFiltersModel): Promise<{ data: ResourceModel[]; count: number }> {
    const where: any = {
      isArchived: false,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.name ? { name: { contains: filters.name, mode: 'insensitive' as const } } : {})
    };

    const [data, count] = await Promise.all([
      prisma.resource.findMany({
        where,
        orderBy: { id: 'desc' },
        take: filters.limit,
        skip: filters.offset
      }),
      prisma.resource.count({ where })
    ]);

    return { data: data.map((d: any) => toDomainModel({
      id: d.id,
      name: d.name,
      description: d.description,
      status: d.status,
      isArchived: d.isArchived ?? false,
      deletedAt: d.deletedAt ?? null,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt
    })), count };
  }

  async findById(id: number): Promise<ResourceModel | null> {
    const found: any = await prisma.resource.findFirst({ where: { id, isArchived: false } });
    return found ? toDomainModel({
      id: found.id,
      name: found.name,
      description: found.description,
      status: found.status,
      isArchived: found.isArchived ?? false,
      deletedAt: found.deletedAt ?? null,
      createdAt: found.createdAt,
      updatedAt: found.updatedAt
    }) : null;
  }

  async updateById(
    id: number,
    patch: Partial<Pick<ResourceModel, 'name' | 'description' | 'status'>>
  ): Promise<ResourceModel | null> {
    try {
      const updated = await prisma.$transaction(async (tx) => {
        const row = await tx.resource.update({
          where: { id },
          data: {
            ...(patch.name !== undefined ? { name: patch.name } : {}),
            ...(patch.description !== undefined ? { description: patch.description } : {}),
            ...(patch.status !== undefined ? { status: toPersistenceStatus(patch.status) } : {})
          }
        });
        return row;
      });

      return toDomainModel({
        id: updated.id,
        name: updated.name,
        description: updated.description,
        status: updated.status,
        isArchived: updated.isArchived ?? false,
        deletedAt: updated.deletedAt ?? null,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt
      });
    } catch (err: any) {
      if (err?.code === 'P2025') return null;
      throw err;
    }
  }

  async deleteById(id: number): Promise<boolean> {
    // soft-delete by default: set is_archived and deleted_at
    const res = await prisma.resource.updateMany({ where: { id, isArchived: false }, data: { isArchived: true, deletedAt: new Date() } });
    return res.count > 0;
  }

  // permanent hard delete
  async hardDeleteById(id: number): Promise<number[]> {
    const rows: Array<{ id: number }> = await prisma.resource.findMany({ where: { id: id }, select: { id: true } });
    if (rows.length === 0) return [];
    await prisma.resource.deleteMany({ where: { id } });
    return rows.map((r) => r.id);
  }

  // hard delete many
  async hardDeleteMany(ids: number[]): Promise<number[]> {
    const rows: Array<{ id: number }> = await prisma.resource.findMany({ where: { id: { in: ids } }, select: { id: true } });
    if (rows.length === 0) return [];
    await prisma.resource.deleteMany({ where: { id: { in: ids } } });
    return rows.map((r) => r.id);
  }

  async batchUpdate(
    ids: number[],
    patch: Partial<Pick<ResourceModel, 'name' | 'description' | 'status'>>
  ): Promise<ResourceModel[]> {
    // make atomic: update and return rows in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.resource.updateMany({
        where: { id: { in: ids } },
        data: {
          ...(patch.name !== undefined ? { name: patch.name } : {}),
          ...(patch.description !== undefined ? { description: patch.description } : {}),
          ...(patch.status !== undefined ? { status: toPersistenceStatus(patch.status) } : {})
        }
      });
    });

    const rows: any[] = await prisma.resource.findMany({ where: { id: { in: ids } } });
    return rows.map((d) => toDomainModel({
      id: d.id,
      name: d.name,
      description: d.description,
      status: d.status,
      isArchived: d.isArchived ?? false,
      deletedAt: d.deletedAt ?? null,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt
    }));
  }

  async batchDelete(ids: number[]): Promise<number[]> {
    // soft-delete in transaction and return ids that were archived
    const result = await prisma.$transaction(async (tx) => {
      const toReturn = await tx.resource.findMany({ where: { id: { in: ids }, isArchived: false }, select: { id: true } });
      await tx.resource.updateMany({ where: { id: { in: ids } }, data: { isArchived: true, deletedAt: new Date() } });
      return toReturn;
    });

    return result.map((r: any) => r.id);
  }
}
