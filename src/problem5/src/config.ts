import "dotenv/config";
import { resolve } from "node:path";

export interface AppConfig {
  port: number;
  databasePath: string;
  jsonLimit: string;
}

function parsePort(value: string | undefined): number {
  const port = Number(value ?? "3000");

  if (!Number.isInteger(port) || port < 0 || port > 65_535) {
    throw new Error("PORT must be an integer between 0 and 65535");
  }

  return port;
}

export function loadConfig(): AppConfig {
  return {
    port: parsePort(process.env.PORT),
    databasePath: process.env.DATABASE_PATH
      ? resolve(process.env.DATABASE_PATH)
      : resolve(process.cwd(), "data", "problem5.sqlite"),
    jsonLimit: process.env.JSON_LIMIT ?? "32kb",
  };
}
