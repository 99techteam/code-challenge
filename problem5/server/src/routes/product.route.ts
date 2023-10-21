import express from "express";
import { API_V1_PRODUCT } from "../constant/apis";
import { ProductController } from "../controllers";
const router = express.Router();
router
  .route(API_V1_PRODUCT.feature.createProduct)
  .post(ProductController.createProduct);
router
  .route(`${API_V1_PRODUCT.feature.getProduct}/:productId`)
  .get(ProductController.getProduct);
router
  .route(API_V1_PRODUCT.feature.getAllProducts)
  .get(ProductController.getAllProducts);
router
  .route(`${API_V1_PRODUCT.feature.updateProduct}/:productId`)
  .patch(ProductController.updateProduct);
router
  .route(`${API_V1_PRODUCT.feature.deleteProduct}/:productId`)
  .delete(ProductController.deleteProduct);

export default router;
