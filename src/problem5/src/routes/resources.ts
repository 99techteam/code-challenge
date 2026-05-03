/**
 * HTTP handlers for `/api/resources`.
 * Mounted in `app.ts` at that path. Register `GET /` before `GET /:id` so the
 * list route is not treated as an id (e.g. "list" would otherwise match :id).
 */
import { Router } from "express";
import {
  createResource,
  deleteResource,
  getResourceById,
  listResources,
  updateResource,
} from "../functions/resources.js";
import type { ResourceRepository } from "../repository.js";

export function createResourcesRouter(repo: ResourceRepository): Router {
  const router = Router();

  // GET /api/resources — list with optional filters: status, q, limit, offset
  router.get("/", (req, res) => listResources(repo, req, res));

  // GET /api/resources/:id — single resource or 404
  router.get("/:id", (req, res) => getResourceById(repo, req, res));

  // POST /api/resources — create (201)
  /**
   * body: {
   *   title: string;
   *   description: string | null;
   *   status: "draft" | "active" | "archived";
   * }
   */
  router.post("/", (req, res) => createResource(repo, req, res));

  // PUT /api/resources/:id — partial update; at least one field required
  /**
   * body: {
   *   title: string;
   *   description: string | null;
   *   status: "draft" | "active" | "archived";
   * }
   */
  router.put("/:id", (req, res) => updateResource(repo, req, res));

  // DELETE /api/resources/:id — 204 on success
  router.delete("/:id", (req, res) => deleteResource(repo, req, res));

  return router;
}
