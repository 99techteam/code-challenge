import "dotenv/config";
import { z } from "zod";

/**
 * Centralised, validated runtime configuration.
 */
const ConfigSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().int().positive().max(65535).default(3000),
  HOST: z.string().min(1).default("127.0.0.1"),
  DATABASE_PATH: z.string().min(1).default("./data/resources.db"),
  LOG_LEVEL: z
    .enum(["trace", "debug", "info", "warn", "error", "fatal", "silent"])
    .default("info"),
  CORS_ORIGINS: z
    .string()
    .default("")
    .transform((s) =>
      s
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean),
    )
    // Reject the dangerous wildcard. We send `credentials: true`, and the
    // pairing of `Access-Control-Allow-Origin: *` with credentials is
    // explicitly forbidden by the CORS spec — and an exfiltration risk if a
    // browser ever did honour it. Force operators to enumerate origins.
    .refine(
      (origins) => !origins.includes("*"),
      { message: "CORS_ORIGINS must not contain '*' — list explicit origins" },
    ),
});

export type AppConfig = z.infer<typeof ConfigSchema>;

function loadConfig(): AppConfig {
  const parsed = ConfigSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map(
      (i) => `${i.path.join(".")}: ${i.message}`,
    );
    throw new Error(`Invalid configuration:\n  - ${issues.join("\n  - ")}`);
  }
  return parsed.data;
}

export const config: AppConfig = loadConfig();
