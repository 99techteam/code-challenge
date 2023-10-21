import express from "express";
import { API_V1_AUTH } from "../constant/apis";
import { AuthController } from "../controllers";
const router = express.Router();
router.route(API_V1_AUTH.feature.register).post(AuthController.register);
router.route(API_V1_AUTH.feature.login).post(AuthController.login);
router.route(API_V1_AUTH.feature.logout).get(AuthController.logout);
router
  .route(API_V1_AUTH.feature.resetPassword)
  .patch(AuthController.resetPassword);
export default router;
