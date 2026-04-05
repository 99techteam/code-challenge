import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { ResourceEntity } from '../../../entities';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'database.sqlite',
  synchronize: true,
  logging: false,
  entities: [ResourceEntity],
  migrations: [],
  subscribers: [],
});
