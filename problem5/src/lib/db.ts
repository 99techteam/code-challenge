import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import logger from '../utils/logger';
import * as schema from "./schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  max: 10,
});

export const db = drizzle(pool, { schema });

export const connectToDatabase = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    logger.info('Successfully connected to PostgreSQL database');
    client.release();
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    throw error;
  }
};

export const closeDatabaseConnection = async (): Promise<void> => {
  try {
    await pool.end();
    logger.info('Database connection pool closed');
  } catch (error) {
    logger.error('Error closing database connection:', error);
    throw error;
  }
};
