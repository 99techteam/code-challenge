import { ClassConstructor } from 'class-transformer';
import {
  DeepPartial,
  DeleteResult,
  FindOptionsWhere,
  UpdateResult,
} from 'typeorm';

export interface IBaseService<T> {
  dto: ClassConstructor<T>;
  all(conditions: FindOptionsWhere<T>): Promise<T[]>;
  find(id: number): Promise<T | null>;
  findOne(
    conditions: FindOptionsWhere<T> | FindOptionsWhere<T>[]
  ): Promise<T | null>;
  create(data: DeepPartial<T>): Promise<T>;
  update(
    conditions: FindOptionsWhere<T>,
    data: Partial<T>
  ): Promise<UpdateResult>;
  delete(conditions: FindOptionsWhere<T>): Promise<DeleteResult>;
  exists(conditions: FindOptionsWhere<T>): Promise<boolean>;
}
