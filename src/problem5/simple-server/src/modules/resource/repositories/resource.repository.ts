import type { FindResourcesDto } from "../dto/find-resources.dto";
import type { ResourceEntity } from "../resource.entity";

export abstract class ResourceRepository {
	abstract find(findOptions: FindResourcesDto): Promise<ResourceEntity[]>;

	abstract findOne(id: number): Promise<ResourceEntity | null>;

	abstract create(
		resource: Omit<ResourceEntity, "id">,
	): Promise<ResourceEntity>;

	abstract update(
		id: number,
		resource: Partial<ResourceEntity>,
	): Promise<ResourceEntity>;

	abstract softDelete(id: number): Promise<ResourceEntity>;

	abstract restore(id: number): Promise<ResourceEntity>;
}
