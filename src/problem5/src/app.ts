import cors from "cors";
import express, { type Application } from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { config } from "./config.js";
import { openDatabase, type DB } from "./db/connection.js";
import { migrate } from "./db/migrate.js";
import { logger } from "./logger.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFound } from "./middleware/not-found.js";
import { requestId } from "./middleware/request-id.js";
import { createResourceController } from "./resources/resource.controller.js";
import { createResourceRepository } from "./resources/resource.repo.js";
import { createResourceRouter } from "./resources/resource.routes.js";
import { createResourceService } from "./resources/resource.service.js";

/**
 * Express app factory.
 *
 * Returns the application + an explicit teardown so tests can spin up an
 * isolated app per file (pointing at `:memory:` SQLite) and close cleanly.
 */
export interface AppHandle {
  app: Application;
  db: DB;
  close: () => void;
}

export function createApp(opts?: { databasePath?: string }): AppHandle {
  const db = openDatabase(opts?.databasePath ?? config.DATABASE_PATH);
  migrate(db);

  // Wire the layers — DI by hand keeps the dependency graph explicit and
  // avoids reaching for a container framework on a single-bounded-context app.
  const repo = createResourceRepository(db);
  const service = createResourceService(repo);
  const controller = createResourceController(service);

  const app = express();

  if (config.NODE_ENV === "production") app.set("trust proxy", 1);

  // Security & infra middleware ordered correctly: request-id first so every
  // log line carries it; pino-http binds the logger before any handler runs.
  app.use(requestId());
  app.use(
    pinoHttp({
      logger,
      customProps: (req) => ({ requestId: req.requestId }),
      // Health checks would otherwise drown the logs.
      autoLogging: { ignore: (req) => req.url?.startsWith("/health") ?? false },
    }),
  );
  app.use(helmet());
  if (config.CORS_ORIGINS.length > 0) {
    app.use(cors({ origin: config.CORS_ORIGINS, credentials: true }));
  }
  app.use(express.json({ limit: "100kb" })); // bound payload to deter DoS
  app.disable("x-powered-by");

  // Coarse global rate limit. Two layers:
  //   - Read traffic (`GET`) gets a generous quota — readers don't strain the
  //     single SQLite writer and we don't want to kneecap legit clients.
  //   - Write traffic (`POST`/`PATCH`/`DELETE`) is tighter, both because
  //     SQLite serialises writes (one busy writer holds everyone up) and
  //     because writes are how an attacker would amplify disk usage.
  // Disabled in test so suite can run hundreds of requests in one tick.
  if (config.NODE_ENV !== "test") {
    const reads = rateLimit({
      windowMs: 60_000,
      limit: 300,
      standardHeaders: "draft-7",
      legacyHeaders: false,
      message: { ok: false, error: { code: "RATE_LIMITED", message: "Too many requests" } },
      skip: (req) => req.method !== "GET",
    });
    const writes = rateLimit({
      windowMs: 60_000,
      limit: 60,
      standardHeaders: "draft-7",
      legacyHeaders: false,
      message: { ok: false, error: { code: "RATE_LIMITED", message: "Too many requests" } },
      skip: (req) => req.method === "GET",
    });
    app.use(reads, writes);
  }

  // Health endpoints — see rules/observability.md
  app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));
  app.get("/health/ready", (_req, res) => {
    try {
      db.prepare("SELECT 1").get();
      res.status(200).json({ status: "ready", db: "ok" });
    } catch (err) {
      logger.error({ err }, "readiness check failed");
      res.status(503).json({ status: "not_ready", db: "unreachable" });
    }
  });

  app.use("/resources", createResourceRouter(controller));
  app.use(notFound());
  app.use(errorHandler);

  return {
    app,
    db,
    close: () => db.close(),
  };
}
