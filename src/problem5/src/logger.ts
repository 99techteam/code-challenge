import pino, { type Logger } from "pino";
import { config } from "./config.js";

/**
 * Process-wide logger.
 *
 * - JSON output in production for log aggregator ingestion (Loki, ELK, Datadog).
 * - Pretty output in development for human readability.
 * - Silent in test by default to keep test runner output clean (override with LOG_LEVEL).
 */
export const logger: Logger =
  config.NODE_ENV === "development"
    ? pino({
        level: config.LOG_LEVEL,
        transport: {
          target: "pino-pretty",
          options: { colorize: true, translateTime: "SYS:HH:MM:ss.l" },
        },
      })
    : pino({
        level: config.NODE_ENV === "test" ? "silent" : config.LOG_LEVEL,
        // PII redaction at the logger layer — see rules/data-privacy.md
        redact: {
          paths: ["req.headers.authorization", "req.headers.cookie", "*.password", "*.token"],
          remove: true,
        },
      });
