/**
 * Main routes configuration for Scoreboard System
 */

import { Router } from "express";
import { createAuthRoutes } from "./authRoutes";
import { createScoreRoutes } from "./scoreRoutes";
import { Database } from "../config/database";
import { ApiResponse } from "../types";

export function createRoutes(database: Database): Router {
  const router = Router();

  // Health check endpoint
  router.get("/health", (req, res) => {
    const response: ApiResponse = {
      success: true,
      message: "Scoreboard server is running",
      data: {
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development",
        version: "1.0.0",
      },
    };

    res.status(200).json(response);
  });

  // API routes
  router.use("/auth", createAuthRoutes(database));
  router.use("/scores", createScoreRoutes(database));

  // 404 handler
  router.use("*", (req, res) => {
    const response: ApiResponse = {
      success: false,
      message: "Route not found",
      error: `Cannot ${req.method} ${req.originalUrl}`,
    };

    res.status(404).json(response);
  });

  return router;
}
