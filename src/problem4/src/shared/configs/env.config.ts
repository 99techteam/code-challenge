import * as dotenv from 'dotenv';
import * as path from 'path';
import { description, name, version } from '../../../package.json';

const envFile =
  process.env.NODE_ENV && ['testing'].includes(process.env.NODE_ENV)
    ? `.env.${process.env.NODE_ENV}`
    : '.env';

dotenv.config({
  path: path.join(process.cwd(), envFile),
});

/**
 * Environment variables
 */

export default {
  app: {
    root_path: path.join(process.cwd()),
    name,
    version,
    description,
    port: Number(process.env.APP_PORT) || 3000,
    host: process.env.APP_HOST ?? 'localhost',
    allow_origin: process.env.ALLOW_ORIGIN ?? '*',
    url: process.env.URL_HOST ?? 'http://localhost:3000/',
    salt_round: (() => {
      const saltRounds = process.env.SALT_ROUND;
      if (saltRounds && !isNaN(Number(saltRounds))) {
        return Number(saltRounds.toString().slice(0, 2));
      }

      return 1;
    })(),
  },
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? '123456',
    name: process.env.DB_NAME ?? 'nodejs',
    dialect: process.env.DB_DIALECT ?? 'postgres',
    max: Number(process.env.DB_POOL_MAX) || 5,
    min: Number(process.env.DB_POOL_MIN) || 0,
    acquire: Number(process.env.DB_POOL_ACQUIRE) || 30000,
    idle: Number(process.env.DB_POOL_IDLE) || 10000,
    logging: process.env.DB_LOGGING === 'true',
    isSync: process.env.DB_SYNC === 'true',
  },
  jwt: {
    secret: process.env.JWT_SCRET ?? 'secret',
    expires_in: Number(process.env.JWT_EXPIRES_IN) || 1, // 1 day
  },
  url_frontend: process.env.URL_FRONT ?? 'http://localhost:3000/',
  timezone: process.env.TIMEZONE ?? 'UTC',
};
