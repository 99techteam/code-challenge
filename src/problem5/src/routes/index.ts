/**
 * Main routes configuration
 */

import { Router } from "express";
import { Database } from "../models/Database";
import { createUserRoutes } from "./userRoutes";

export function createRoutes(database: Database): Router {
  const router = Router();

  // User routes
  router.use("/users", createUserRoutes(database));

  return router;
}
