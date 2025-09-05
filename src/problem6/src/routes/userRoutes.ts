/**
 * User routes
 */

import { Router } from "express";
import { UserController } from "../controllers/userController";
import { UserService } from "../services/userService";
import { Database } from "../config/database";
import { validateBody, validateQuery, validateParams } from "../validation";
import {
  createUserSchema,
  updateUserSchema,
  userFiltersSchema,
  paginationSchema,
  idParamSchema,
} from "../validation/schemas";

export function createUserRoutes(database: Database): Router {
  const router = Router();
  const userService = new UserService(database);
  const userController = new UserController(userService);

  /**
   * @route   POST /api/v1/users
   * @desc    Create a new user
   * @access  Public
   */
  router.post("/", validateBody(createUserSchema), userController.createUser);

  /**
   * @route   GET /api/v1/users
   * @desc    Get all users with filtering and pagination
   * @access  Public
   */
  router.get(
    "/",
    validateQuery(userFiltersSchema.concat(paginationSchema)),
    userController.getUsers
  );

  /**
   * @route   GET /api/v1/users/stats
   * @desc    Get user statistics
   * @access  Public
   */
  router.get("/stats", userController.getUserStats);

  /**
   * @route   GET /api/v1/users/:id
   * @desc    Get user by ID
   * @access  Public
   */
  router.get("/:id", validateParams(idParamSchema), userController.getUserById);

  /**
   * @route   PUT /api/v1/users/:id
   * @desc    Update user by ID
   * @access  Public
   */
  router.put(
    "/:id",
    validateParams(idParamSchema),
    validateBody(updateUserSchema),
    userController.updateUser
  );

  /**
   * @route   DELETE /api/v1/users/:id
   * @desc    Delete user by ID
   * @access  Public
   */
  router.delete(
    "/:id",
    validateParams(idParamSchema),
    userController.deleteUser
  );

  return router;
}
