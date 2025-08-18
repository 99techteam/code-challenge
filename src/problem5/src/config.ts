import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Simplified application configuration
 */
export const config = {
  port: parseInt(process.env['PORT'] || '3000'),
  nodeEnv: process.env['NODE_ENV'] || 'development',
  database: {
    host: process.env['DB_HOST'] || 'localhost',
    port: parseInt(process.env['DB_PORT'] || '5432'),
    database: process.env['DB_NAME'] || 'problem5_db',
    user: process.env['DB_USER'] || 'postgres',
    password: process.env['DB_PASSWORD'] || 'postgres',
    max: parseInt(process.env['DB_MAX_CONNECTIONS'] || '20'),
    idleTimeoutMillis: parseInt(process.env['DB_IDLE_TIMEOUT'] || '30000'),
    connectionTimeoutMillis: parseInt(
      process.env['DB_CONNECTION_TIMEOUT'] || '2000'
    ),
  },
  corsOrigins: (
    process.env['CORS_ORIGINS'] || 'http://localhost:3000,http://localhost:3001'
  ).split(','),
} as const;

export default config;
