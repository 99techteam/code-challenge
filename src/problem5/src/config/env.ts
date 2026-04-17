import dotenv from "dotenv";

dotenv.config();

const defaultDatabaseUrl = "postgres://app:app@127.0.0.1:5433/my_challenge";
const defaultTestDatabaseUrl = "postgres://app:app@127.0.0.1:5433/my_challenge_test";

function readEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;

  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: readEnv("DATABASE_URL", defaultDatabaseUrl),
  testDatabaseUrl: readEnv("TEST_DATABASE_URL", defaultTestDatabaseUrl)
};
