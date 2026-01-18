import express from "express";
import resourceRoutes from "./resource/resource.routes";
import { AppDataSource } from "./database";

export const createApp = async () => {
  await AppDataSource.initialize();
  const app = express();
  app.use(express.json());
  app.use("/resources", resourceRoutes);
  return app;
};
