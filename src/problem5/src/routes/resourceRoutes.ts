import { Router } from "express";
import {
    createResource,
    deleteResource,
    getResource,
    listAllResources,
    updateResource,
} from "../controllers/resourceController.js";

export const resourceRouter = Router();

resourceRouter.post("/", createResource);
resourceRouter.get("/", listAllResources);
resourceRouter.get("/:id", getResource);
resourceRouter.put("/:id", updateResource);
resourceRouter.delete("/:id", deleteResource);
