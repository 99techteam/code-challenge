import { Router } from "express";
import type { ResourceController } from "./resource.controller.js";

/**
 * REST routes for the Resource aggregate.
 *
 * Conventions:
 *   - Plural resource noun (`/resources`)
 *   - HTTP verbs map 1:1 to CRUD
 *   - Path-only id; no `/by-id/{id}` boilerplate
 *
 * Every endpoint here is documented in README.md with curl examples.
 */
export function createResourceRouter(controller: ResourceController): Router {
  const router = Router();
  router.post("/", controller.create);
  router.get("/", controller.list);
  router.get("/:id", controller.getById);
  router.patch("/:id", controller.update);
  router.delete("/:id", controller.delete);
  return router;
}
