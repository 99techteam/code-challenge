import express from "express";
import cors from "cors";
import { DataSource } from "typeorm";
import { createResourceRouter } from "./routes/resource.routes";
import { errorHandler } from "./middleware/error-handler";

export function createApp(dataSource: DataSource) {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use("/resources", createResourceRouter(dataSource));
  app.use(errorHandler);

  return app;
}
