import dotenv from "dotenv";
import fs from "fs";

const env = process.env.NODE_ENV || "development";

const envFile = env === "production" ? ".env.production" : ".env";

if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile });
} else {
  console.warn(`Environment file ${envFile} not found.`);
}

// Mapper for environment variables
export const environment = process.env.NODE_ENV;
export const port = process.env.PORT;
export const logDirectory = process.env.LOG_DIR;

export const db = {
  name: process.env.DB_NAME || '',
  host: process.env.DB_HOST || '',
  port: process.env.DB_PORT || '',
  user: process.env.DB_USER || '',
  password: process.env.DB_USER_PWD || '',
  minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE || '5'),
  maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE || '10'),
};
