import cors from "cors";
import express from "express";
import type Database from "better-sqlite3";
import { ResourceRepository } from "./repository.js";
import { createResourcesRouter } from "./routes/resources.js";

export function createApp(db: Database.Database) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const repo = new ResourceRepository(db);
  app.use("/api/resources", createResourcesRouter(repo));

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use((_req, res) => {
    res.status(404).json({ error: "Not found." });
  });

  return app;
}
