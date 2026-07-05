import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
  SHUTDOWN_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),
  DB_HOST: z.string().min(1, 'DB_HOST environment variable is required'),
  DB_PORT: z.coerce.number().int().positive().default(5432),
  DB_USER: z.string().min(1, 'DB_USER environment variable is required'),
  DB_PASSWORD: z.string().min(1, 'DB_PASSWORD environment variable is required'),
  DB_NAME: z.string().min(1, 'DB_NAME environment variable is required'),
  DB_MAX_CONNECTIONS: z.coerce.number().int().positive().default(10),
  DB_CONNECTION_TIMEOUT_MS: z.coerce.number().int().positive().default(5000),
  DB_QUERY_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),
});

const configSchema = z.object({
  port: z.number(),
  nodeEnv: z.enum(['development', 'production', 'test']),
  logLevel: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']),
  shutdownTimeoutMs: z.number(),
  database: z.object({
    host: z.string(),
    port: z.number(),
    user: z.string(),
    password: z.string(),
    database: z.string(),
    maxConnections: z.number(),
    connectionTimeoutMs: z.number(),
    queryTimeoutMs: z.number(),
  }),
});

type Config = z.infer<typeof configSchema>;

const parseConfig = (): Config => {
  try {
    const env = envSchema.parse(process.env);
    return {
      port: env.PORT,
      nodeEnv: env.NODE_ENV,
      logLevel: env.LOG_LEVEL,
      shutdownTimeoutMs: env.SHUTDOWN_TIMEOUT_MS,
      database: {
        host: env.DB_HOST,
        port: env.DB_PORT,
        user: env.DB_USER,
        password: env.DB_PASSWORD,
        database: env.DB_NAME,
        maxConnections: env.DB_MAX_CONNECTIONS,
        connectionTimeoutMs: env.DB_CONNECTION_TIMEOUT_MS,
        queryTimeoutMs: env.DB_QUERY_TIMEOUT_MS,
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new Error(`Configuration validation failed: ${messages}`);
    }
    throw error;
  }
};

export const config: Config = parseConfig();
