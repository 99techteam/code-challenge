import { dataSource } from "../db/dbConfig.js";
import { ResourceEntity } from "../entities/ResourceEntity.js";
import type { Resource, ResourceFilters } from "../types/resource.js";

function getRepository() {
    if (!dataSource.isInitialized) {
        throw new Error("Database connection has not been initialized");
    }

    return dataSource.getRepository(ResourceEntity);
}

function mapResource(entity: ResourceEntity): Resource {
    return {
        id: entity.id,
        name: entity.name,
        description: entity.description,
        isFinish: entity.isFinish,
        createdAt: entity.createdAt.toISOString(),
        updatedAt: entity.updatedAt.toISOString(),
    };
}

export async function createResource(input: {
    name: string;
    description: string;
    isFinish: boolean;
}): Promise<Resource> {
    const repository = getRepository();
    const entity = repository.create(input);
    const saved = await repository.save(entity);
    return mapResource(saved);
}

export async function listResources(
    filters: ResourceFilters,
): Promise<Resource[]> {
    const repository = getRepository();
    const queryBuilder = repository
        .createQueryBuilder("resource")
        .orderBy("resource.id", "ASC");

    if (filters.isFinish !== undefined) {
        queryBuilder.andWhere("resource.isFinish = :isFinish", {
            isFinish: filters.isFinish,
        });
    }

    if (filters.search) {
        const searchTerm = `%${filters.search.toLowerCase()}%`;
        queryBuilder.andWhere(
            "(LOWER(resource.name) LIKE :searchTerm OR LOWER(resource.description) LIKE :searchTerm)",
            { searchTerm },
        );
    }

    const rows = await queryBuilder.getMany();
    return rows.map(mapResource);
}

export async function getResourceById(id: number): Promise<Resource | null> {
    const repository = getRepository();
    const row = await repository.findOneBy({ id });

    if (!row) {
        return null;
    }

    return mapResource(row);
}

export async function updateResource(
    id: number,
    input: {
        name?: string;
        description?: string;
        isFinish?: boolean;
    },
): Promise<Resource | null> {
    const repository = getRepository();
    const entity = await repository.findOneBy({ id });

    if (!entity) {
        return null;
    }

    repository.merge(entity, input);
    const saved = await repository.save(entity);
    return mapResource(saved);
}

export async function deleteResource(id: number): Promise<boolean> {
    const repository = getRepository();
    const result = await repository.delete(id);
    return (result.affected ?? 0) > 0;
}
