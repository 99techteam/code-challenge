import { defineConfig } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';
import { Book } from './src/entities/Book';

export default defineConfig({
  driver: PostgreSqlDriver,
  dbName: process.env.DB_NAME || 'crud_server',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  entities: [Book],
  migrations: {
    path: './src/database/migrations',
  },
  extensions: [Migrator],
  debug: process.env.NODE_ENV !== 'production',
  logger: (message) => console.log(message),
}); 