import { Router } from "express";
import productController from "../../controllers/product.controller";

const router = Router();

router.get("/", productController.getProductList);

router.get("/:id", productController.getProductById);

router.post("/", productController.createProduct);

router.put("/:id", productController.updateProduct);

router.delete("/:id", productController.deleteProduct);

export default router;
