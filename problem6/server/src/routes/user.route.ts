import express from "express";
import { API_V1_USER } from "../constant/apis";
import { UserController } from "../controllers";
import { authentication } from "../middleware/auth.middleware";
const router = express.Router();

router.route(API_V1_USER.feature.getAllUsers).get(UserController.getAllUsers);
router
  .route(API_V1_USER.feature.updatePoint)
  .patch(authentication, UserController.updatePoint);

export default router;
