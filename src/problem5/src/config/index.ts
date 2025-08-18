import dotenv from 'dotenv';
import { AppConfig } from '../types';

// Load environment variables
dotenv.config();

const getEnvVar = (name: string, defaultValue?: string): string => {
  const value = process.env[name];
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${name} is required`);
  }
  return value || defaultValue!;
};

const getEnvNumber = (name: string, defaultValue: number): number => {
  const value = process.env[name];
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${name} must be a valid number`);
  }
  return parsed;
};

export const config: AppConfig = {
  port: getEnvNumber('PORT', 3000),
  nodeEnv: getEnvVar('NODE_ENV', 'development'),
  database: {
    host: getEnvVar('DB_HOST', 'localhost'),
    port: getEnvNumber('DB_PORT', 5432),
    database: getEnvVar('DB_NAME', 'problem5_db'),
    user: getEnvVar('DB_USER', 'postgres'),
    password: getEnvVar('DB_PASSWORD', 'postgres'),
    max: getEnvNumber('DB_MAX_CONNECTIONS', 20),
    idleTimeoutMillis: getEnvNumber('DB_IDLE_TIMEOUT', 30000),
    connectionTimeoutMillis: getEnvNumber('DB_CONNECTION_TIMEOUT', 2000),
  },
  corsOrigins: getEnvVar('CORS_ORIGINS', 'http://localhost:3000,http://localhost:3001').split(','),
};
