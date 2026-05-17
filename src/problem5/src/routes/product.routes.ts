import { Router } from "express";
import { productController } from "../controllers/product.controller";
import { asyncHandler } from "../middlewares/asyncHandler";
import { validate } from "../middlewares/validate.middleware";
import { productValidator } from "../validators/product.validators";

const router = Router();

router.post(
  "/",
  validate(productValidator.create),
  asyncHandler(productController.create)
);

router.get(
  "/",
  validate(productValidator.findAll),
  asyncHandler(productController.findAll)
);

router.get(
  "/:id",
  validate(productValidator.findById),
  asyncHandler(productController.findById)
);

router.put(
  "/:id",
  validate(productValidator.update),
  asyncHandler(productController.update)
);

router.delete(
  "/:id",
  validate(productValidator.delete),
  asyncHandler(productController.delete)
);

export default router;
