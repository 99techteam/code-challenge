import express, {
  type Express,
  type Request,
  type Response,
} from "express";
import { Database } from "./database";
import {
  createErrorHandler,
  createNotFoundHandler,
  requestContext,
} from "./http/middleware";
import {
  createAuditLogRouter,
  createTroubleLogRouter,
} from "./http/observability.routes";
import { createTaskRouter } from "./http/task.routes";
import { ObservabilityRepository } from "./repositories/observability.repository";
import { TaskRepository } from "./repositories/task.repository";
import { ObservabilityService } from "./services/observability.service";
import { TaskService } from "./services/task.service";

export interface AppResources {
  app: Express;
  database: Database;
  repository: TaskRepository;
  observabilityRepository: ObservabilityRepository;
}

export interface CreateAppOptions {
  databasePath: string;
  jsonLimit?: string;
}

export function createApp(options: CreateAppOptions): AppResources {
  const database = new Database(options.databasePath);
  const repository = new TaskRepository(database);
  const observabilityRepository =
    new ObservabilityRepository(database);

  const taskService = new TaskService(repository);
  const observabilityService =
    new ObservabilityService(observabilityRepository);

  const app = express();

  app.disable("x-powered-by");

  // Must run before express.json so malformed JSON also receives a requestId
  // and is written to trouble_logs.
  app.use(requestContext);
  app.use(
    express.json({
      limit: options.jsonLimit ?? "32kb",
    }),
  );

  app.get("/health", (_request: Request, response: Response) => {
    response.json({
      status: "ok",
      service: "problem5-crude-server",
      timestamp: new Date().toISOString(),
    });
  });

  app.use("/api/v1/tasks", createTaskRouter(taskService));
  app.use(
    "/api/v1/audit-logs",
    createAuditLogRouter(observabilityService),
  );
  app.use(
    "/api/v1/trouble-logs",
    createTroubleLogRouter(observabilityService),
  );

  app.use(createNotFoundHandler(observabilityService));
  app.use(createErrorHandler(observabilityService));

  return {
    app,
    database,
    repository,
    observabilityRepository,
  };
}
