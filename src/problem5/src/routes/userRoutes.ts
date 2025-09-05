/**
 * User routes
 */

import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { UserService } from "../services/UserService";
import { Database } from "../models/Database";

export function createUserRoutes(database: Database): Router {
  const router = Router();
  const userService = new UserService(database);
  const userController = new UserController(userService);

  /**
   * @route   POST /api/users
   * @desc    Create a new user
   * @access  Public
   */
  router.post("/", userController.createUser);

  /**
   * @route   GET /api/users
   * @desc    Get all users with filters and pagination
   * @access  Public
   */
  router.get("/", userController.getUsers);

  /**
   * @route   GET /api/users/:id
   * @desc    Get user by ID
   * @access  Public
   */
  router.get("/:id", userController.getUserById);

  /**
   * @route   PUT /api/users/:id
   * @desc    Update user by ID
   * @access  Public
   */
  router.put("/:id", userController.updateUser);

  /**
   * @route   DELETE /api/users/:id
   * @desc    Delete user by ID
   * @access  Public
   */
  router.delete("/:id", userController.deleteUser);

  return router;
}
