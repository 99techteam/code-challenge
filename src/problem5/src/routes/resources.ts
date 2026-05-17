import { Router } from "express";
import {
  CreateResourceInput,
  ListResourcesQuery,
  UpdateResourceInput,
} from "../schemas/resource.ts";
import {
  createResource,
  deleteResource,
  getResource,
  listResources,
  updateResource,
} from "../services/resources.ts";
import { HttpError } from "../middleware/errorHandler.ts";
import { createIdempotencyMiddleware } from "../middleware/idempotency.ts";

export const resourcesRouter: Router = Router();

resourcesRouter.post("/", createIdempotencyMiddleware(), (req, res) => {
  const input = CreateResourceInput.parse(req.body);
  const created = createResource(input);
  res.status(201).json(created);
});

resourcesRouter.get("/", (req, res) => {
  const query = ListResourcesQuery.parse(req.query);
  const result = listResources(query);
  res.json(result);
});

resourcesRouter.get("/:id", (req, res) => {
  const resource = getResource(req.params.id);
  if (!resource) throw new HttpError(404, "Resource not found");
  res.json(resource);
});

resourcesRouter.patch("/:id", (req, res) => {
  const input = UpdateResourceInput.parse(req.body);
  const updated = updateResource(req.params.id, input);
  if (!updated) throw new HttpError(404, "Resource not found");
  res.json(updated);
});

resourcesRouter.delete("/:id", (req, res) => {
  const deleted = deleteResource(req.params.id);
  if (!deleted) throw new HttpError(404, "Resource not found");
  res.status(204).send();
});
