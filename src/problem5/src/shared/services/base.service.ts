import {
	Repository,
	FindOptionsWhere,
	UpdateResult,
	DeleteResult,
	ObjectLiteral,
	DeepPartial,
} from 'typeorm';
import { ClassConstructor } from 'class-transformer';
import { plainObject } from '../dto';

export abstract class BaseService<T extends ObjectLiteral> {
	constructor(
		protected repository: Repository<T>,
		public dto: ClassConstructor<T>,
	) {}

	public async all(conditions: FindOptionsWhere<T>): Promise<T[]> {
		return await this.repository.find({
			where: conditions,
		});
	}

	public async find(id: number): Promise<T | null> {
		return await this.repository.findOneById(id);
	}

	public async findOne(
		conditions: FindOptionsWhere<T> | FindOptionsWhere<T>[],
	) {
		return await this.repository.findOneBy(conditions);
	}

	public async create(data: DeepPartial<T>): Promise<T> {
		const entity = this.repository.create(data);
		const createEntity = await this.repository.save(entity);
		return plainObject(this.dto, createEntity);
	}

	public async update(
		conditions: FindOptionsWhere<T>,
		data: Partial<T>,
	): Promise<UpdateResult> {
		return await this.repository.update(conditions, data);
	}

	public async delete(
		conditions: FindOptionsWhere<T>,
	): Promise<DeleteResult> {
		return await this.repository.delete(conditions);
	}

	public async exists(conditions: FindOptionsWhere<T>): Promise<boolean> {
		return await this.repository.exist({
			where: conditions,
		});
	}
}
