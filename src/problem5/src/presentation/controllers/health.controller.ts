import { Request, Response } from "express";
import { AppDataSource } from "../../infrastructure/persistence/database.config";

export function healthCheck(_req: Request, res: Response): void {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    database: AppDataSource.isInitialized ? "connected" : "disconnected",
  });
}
