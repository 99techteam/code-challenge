import { Router } from "express";
import { DataSource } from "typeorm";
import { ResourceController } from "../controllers/resource.controller";
import { asyncHandler } from "../middleware/async-handler";
import { ResourceService } from "../services/resource.service";

export function createResourceRouter(dataSource: DataSource): Router {
  const router = Router();
  const resourceController = new ResourceController(new ResourceService(dataSource));

  router.post("/", asyncHandler(resourceController.createResource));
  router.get("/", asyncHandler(resourceController.listResources));
  router.get("/:id", asyncHandler(resourceController.getResource));
  router.put("/:id", asyncHandler(resourceController.updateResource));
  router.post("/:id/increment", asyncHandler(resourceController.incrementResourceQuantity));
  router.delete("/:id", asyncHandler(resourceController.deleteResource));

  return router;
}
