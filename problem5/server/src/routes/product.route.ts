import express from "express";
import { API_V1_User } from "../constant/apis";
import { UserController } from "../controllers";
const router = express.Router();
router
  .route(API_V1_User.feature.createUser)
  .post(UserController.createUser);
router
  .route(`${API_V1_User.feature.getUser}/:UserId`)
  .get(UserController.getUser);
router
  .route(API_V1_User.feature.getAllUsers)
  .get(UserController.getAllUsers);
router
  .route(`${API_V1_User.feature.updateUser}/:UserId`)
  .patch(UserController.updateUser);
router
  .route(`${API_V1_User.feature.deleteUser}/:UserId`)
  .delete(UserController.deleteUser);

export default router;
