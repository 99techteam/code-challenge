import "reflect-metadata";
import express, { Application } from "express";
import swaggerUi from "swagger-ui-express";
import { ITaskRepository } from "./domain/repositories/task.repository.interface";
import { createRouter } from "./presentation/routes";
import { errorHandler } from "./presentation/middlewares/error-handler.middleware";
import { swaggerSpec } from "./infrastructure/swagger/swagger.config";

export function createApp(taskRepository: ITaskRepository): Application {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/docs.json", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  app.use("/api", createRouter(taskRepository));

  app.use(errorHandler);

  return app;
}
