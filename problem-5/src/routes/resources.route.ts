import { Router } from "express";
import { resourceController } from "../controllers/resources.controller";
import { validate } from "../validations/validation.middleware";
import {
  createResourceSchema,
  updateResourceSchema
} from "../validations/resource.validation";

const router = Router();

router.post("/", validate(createResourceSchema), (req, res) =>
  resourceController.create(req, res)
);
router.get("/", (req, res) => resourceController.getAll(req, res));
router.get("/:id", (req, res) => resourceController.getById(req, res));
router.put("/:id", validate(updateResourceSchema), (req, res) =>
  resourceController.updateById(req, res)
);
router.delete("/:id", (req, res) => resourceController.deleteById(req, res));

export default router;
