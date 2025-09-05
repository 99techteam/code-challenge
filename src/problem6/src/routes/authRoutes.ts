/**
 * Authentication routes
 */

import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { AuthService } from "../services/authService";
import { Database } from "../config/database";
import { validateBody } from "../validation";
import { createUserSchema, loginSchema } from "../validation/schemas";
import { AuthMiddleware } from "../middleware/auth";

export function createAuthRoutes(database: Database): Router {
  const router = Router();
  const authService = new AuthService(database);
  const authController = new AuthController(authService);
  const authMiddleware = new AuthMiddleware(authService);

  /**
   * @route   POST /api/auth/register
   * @desc    Register a new user
   * @access  Public
   */
  router.post(
    "/register",
    validateBody(createUserSchema),
    authController.register
  );

  /**
   * @route   POST /api/auth/login
   * @desc    Login user
   * @access  Public
   */
  router.post("/login", validateBody(loginSchema), authController.login);

  /**
   * @route   GET /api/auth/profile
   * @desc    Get current user profile
   * @access  Private
   */
  router.get(
    "/profile",
    authMiddleware.authenticate,
    authController.getProfile
  );

  return router;
}
