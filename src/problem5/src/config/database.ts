import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Resource } from '../modules/resource/resource.model';
import { env } from './env';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: env.dbPath,
  entities: [Resource],
  synchronize: true,
  logging: env.nodeEnv === 'development',
});
