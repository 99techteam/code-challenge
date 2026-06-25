import { DataSource } from 'typeorm';
import { Resource } from './entity/Resource';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: './data/database.sqlite',
  synchronize: true,
  logging: false,
  entities: [Resource],
  migrations: [],
  subscribers: []
});
