import type { Insertable, Selectable, Updateable } from "kysely";
import type { KyselyInstance, Resource } from "../../../database";
import type { FindResourcesDto } from "../dto/find-resources.dto";
import type { UpdateResourceDto } from "../dto/update-resource.dto";
import { ResourceEntity } from "../resource.entity";
import { ResourceRepository } from "./resource.repository";

export class RelationalResourceRepository extends ResourceRepository {
	constructor(private readonly kysely: KyselyInstance) {
		super();
	}

	async find(findOptions: FindResourcesDto) {
		let query = this.kysely
			.selectFrom("resource")
			.select(
				findOptions.select && findOptions.select.length > 0
					? findOptions.select
					: [
							"id",
							"name",
							"description",
							"createdAt",
							"updatedAt",
							"deletedAt",
						],
			)
			.where("deletedAt", "is", null);

		if (findOptions.filter?.name) {
			query = query.where("name", "like", `%${findOptions.filter.name}%`);
		}

		if (findOptions.filter?.description) {
			query = query.where(
				"description",
				"like",
				`%${findOptions.filter.description}%`,
			);
		}

		if (findOptions.sort?.field) {
			query = query.orderBy(findOptions.sort.field, findOptions.sort.order);
		}

		if (findOptions.pagination?.limit) {
			query = query.limit(findOptions.pagination.limit);
		}

		if (findOptions.pagination?.page) {
			query = query.offset(
				(findOptions.pagination.page - 1) * (findOptions.pagination.limit ?? 0),
			);
		}
		const resources = await query.execute();
		return resources.map((resource) => this.toEntity(resource));
	}

	async findOne(id: number) {
		const resource = await this.kysely
			.selectFrom("resource")
			.select([
				"id",
				"name",
				"description",
				"createdAt",
				"updatedAt",
				"deletedAt",
			])
			.where("id", "=", id)
			.executeTakeFirst();
		if (!resource) return null;
		return this.toEntity(resource);
	}

	async create(resource: Insertable<Resource>) {
		delete resource.id;
		const createdResource = await this.kysely
			.insertInto("resource")
			.values(resource)
			.returning([
				"id",
				"name",
				"description",
				"createdAt",
				"updatedAt",
				"deletedAt",
			])
			.executeTakeFirstOrThrow();
		return this.toEntity(createdResource);
	}

	async update(id: number, resource: UpdateResourceDto) {
		const setStatemenet: Updateable<Resource> = {};
		if (resource.name) setStatemenet.name = resource.name;
		if (resource.description) setStatemenet.description = resource.description;
		const updatedResource = await this.kysely
			.updateTable("resource")
			.set(setStatemenet)
			.where("id", "=", id)
			.returning([
				"id",
				"name",
				"description",
				"createdAt",
				"updatedAt",
				"deletedAt",
			])
			.executeTakeFirstOrThrow();
		return this.toEntity(updatedResource);
	}

	async softDelete(id: number) {
		const deletedResource = await this.kysely
			.updateTable("resource")
			.set({ deletedAt: new Date() })
			.where("id", "=", id)
			.returning([
				"id",
				"name",
				"description",
				"createdAt",
				"updatedAt",
				"deletedAt",
			])
			.executeTakeFirstOrThrow();
		return this.toEntity(deletedResource);
	}

	async restore(id: number) {
		const restoredResource = await this.kysely
			.updateTable("resource")
			.set({ deletedAt: null })
			.where("id", "=", id)
			.returning([
				"id",
				"name",
				"description",
				"createdAt",
				"updatedAt",
				"deletedAt",
			])
			.executeTakeFirstOrThrow();
		return this.toEntity(restoredResource);
	}

	async deletePermanently(id: number) {
		await this.kysely
			.deleteFrom("resource")
			.where("id", "=", id)
			.returning([
				"id",
				"name",
				"description",
				"createdAt",
				"updatedAt",
				"deletedAt",
			])
			.execute();
	}

	private toEntity(resource: Partial<Selectable<Resource>>): ResourceEntity {
		const entity = ResourceEntity.create();
		if (resource.id !== undefined) entity.setId(resource.id);
		if (resource.name) entity.setName(resource.name);
		if (resource.description) entity.setDescription(resource.description);
		if (resource.createdAt) entity.setCreatedAt(resource.createdAt);
		if (resource.updatedAt) entity.setUpdatedAt(resource.updatedAt);
		if (resource.deletedAt) entity.setDeletedAt(resource.deletedAt);
		return entity;
	}
}
