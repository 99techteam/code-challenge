export class ResourceEntity {
	public id: number;
	public name: string;
	public description: string;
	public createdAt: Date;
	public updatedAt: Date;
	public deletedAt?: Date;

	static create() {
		return new ResourceEntity();
	}

	public setId(id: number) {
		this.id = id;
		return this;
	}

	public setName(name: string) {
		this.name = name;
		return this;
	}

	public setDescription(description: string) {
		this.description = description;
		return this;
	}

	public setUpdatedAt(updatedAt: Date) {
		this.updatedAt = updatedAt;
		return this;
	}

	public setDeletedAt(deletedAt: Date) {
		this.deletedAt = deletedAt;
		return this;
	}

	public setCreatedAt(createdAt: Date) {
		this.createdAt = createdAt;
		return this;
	}
}
