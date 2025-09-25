import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db } from './db';
import logger from '../utils/logger';

export async function runMigrations() {
  try {
    logger.info('Starting database migrations...');
    await migrate(db, { migrationsFolder: './drizzle/migrations' });
    logger.info('Database migrations completed successfully');
  } catch (error) {
    logger.error('Failed to run migrations:', error);
    throw error;
  }
}
