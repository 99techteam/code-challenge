import { Router } from "express";
import { ResourceController } from "./resource.controller";
import { ResourceUseCases } from "./resource.usecases";
import { ResourceRepository } from "./resource.repository";
import { AppDataSource } from "../database";
import { ResourceOrmEntity } from "./resource.orm-entity";

const repo = new ResourceRepository(
  AppDataSource.getRepository(ResourceOrmEntity)
);

const useCases = new ResourceUseCases(repo);
const controller = new ResourceController(useCases);

const router = Router();

router.post("/", controller.create);
router.get("/", controller.list);
router.get("/:id", controller.get);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);

export default router;
