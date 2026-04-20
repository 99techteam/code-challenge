import { Router } from "express";

import {
  createResource,
  deleteResource,
  getResource,
  listResources,
  updateResource
} from "../controllers/resource-controller.js";
import { requireAuth } from "../middleware/auth.js";

export const resourceRouter = Router();

resourceRouter.use(requireAuth);
resourceRouter.post("/resources", createResource);
resourceRouter.get("/resources", listResources);
resourceRouter.get("/resources/:id", getResource);
resourceRouter.put("/resources/:id", updateResource);
resourceRouter.delete("/resources/:id", deleteResource);
