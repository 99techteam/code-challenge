import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Resource } from './entities';

export const datasource = new DataSource({
  type: 'better-sqlite3',
  database: 'src/problem5/database.sqlite',
  synchronize: true,
  logging: false,
  entities: [Resource],
});
