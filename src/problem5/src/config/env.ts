import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

// Environment variable schema for validation
const envSchema = z.object({
  // Application Environment
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Server Configuration
  PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(65535))
    .default(() => 3000),

  // Database Configuration
  DB_HOST: z.string().min(1).default("localhost"),
  DB_PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(65535))
    .default(() => 5432),
  DB_USERNAME: z.string().min(1).default("postgres"),
  DB_PASSWORD: z.string().min(1),
  DB_NAME: z.string().min(1).default("crud_server"),

  // Logging
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),

  // API Documentation
  ENABLE_OPENAPI: z
    .string()
    .transform((val) => val !== "false")
    .default(() => true),
  ENABLE_SWAGGER_UI: z
    .string()
    .transform((val) => val !== "false")
    .default(() => true),
});

// Environment type
export type EnvConfig = z.infer<typeof envSchema>;

// Validate and parse environment variables
const parseEnv = (): EnvConfig => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("Invalid environment variables:");
    result.error.issues.forEach((issue) => {
      console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
    });
    process.exit(1);
  }

  return result.data;
};

// Environment configuration object
export const env = parseEnv();

// Environment constants
export const ENV = {
  // Application
  nodeEnv: env.NODE_ENV,
  port: env.PORT,

  // Database
  db: {
    host: env.DB_HOST,
    port: env.DB_PORT,
    username: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    name: env.DB_NAME,
    url: `postgresql://${env.DB_USERNAME}:${env.DB_PASSWORD}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`,
  },

  // Logging
  logLevel: env.LOG_LEVEL,

  // API Documentation
  openapi: {
    enabled: env.ENABLE_OPENAPI,
    swaggerUiEnabled: env.ENABLE_SWAGGER_UI,
  },

  // Feature flags
  features: {
    openapiEnabled: env.ENABLE_OPENAPI,
    swaggerUiEnabled: env.ENABLE_SWAGGER_UI,
  },
} as const;

// Environment validation helpers
export const isDevelopment = ENV.nodeEnv === "development";
export const isProduction = ENV.nodeEnv === "production";
export const isTest = ENV.nodeEnv === "test";

// Database configuration helper
export const getDatabaseConfig = () => ({
  host: ENV.db.host,
  port: ENV.db.port,
  username: ENV.db.username,
  password: ENV.db.password,
  database: ENV.db.name,
  url: ENV.db.url,
});

// Server configuration helper
export const getServerConfig = () => ({
  port: ENV.port,
  nodeEnv: ENV.nodeEnv,
  logLevel: ENV.logLevel,
});

// API documentation configuration helper
export const getApiDocsConfig = () => ({
  openapiEnabled: ENV.features.openapiEnabled,
  swaggerUiEnabled: ENV.features.swaggerUiEnabled,
});
