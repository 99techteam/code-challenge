import { Pool, PoolConfig } from 'pg';
import { config } from '../config';

let pool: Pool | null = null;

export const createDatabasePool = (): Pool => {
  if (pool) {
    return pool;
  }

  const poolConfig: PoolConfig = {
    host: config.database.host,
    port: config.database.port,
    database: config.database.database,
    user: config.database.user,
    password: config.database.password,
    max: config.database.max,
    idleTimeoutMillis: config.database.idleTimeoutMillis,
    connectionTimeoutMillis: config.database.connectionTimeoutMillis,
    ssl:
      process.env['NODE_ENV'] === 'production'
        ? { rejectUnauthorized: false }
        : false,
  };

  pool = new Pool(poolConfig);

  // Handle pool errors
  pool.on('error', err => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
  });

  // Handle pool connection
  pool.on('connect', () => {
    console.log('Connected to PostgreSQL database');
  });

  return pool;
};

export const getDatabasePool = (): Pool => {
  if (!pool) {
    throw new Error(
      'Database pool not initialized. Call createDatabasePool first.'
    );
  }
  return pool;
};

export const closeDatabasePool = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('Database pool closed');
  }
};

export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    const client = await getDatabasePool().connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('Database connection test successful');
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
};
