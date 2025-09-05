/**
 * Authentication middleware
 */

import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/authService";
import { ApiResponse } from "../types";

export class AuthMiddleware {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  /**
   * JWT authentication middleware
   */
  public authenticate = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        const response: ApiResponse = {
          success: false,
          message: "No token provided",
        };
        res.status(401).json(response);
        return;
      }

      const token = authHeader.substring(7); // Remove "Bearer " prefix
      const user = this.authService.verifyToken(token);

      req.user = user;
      next();
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: "Invalid token",
        error: error instanceof Error ? error.message : "Unknown error",
      };
      res.status(401).json(response);
    }
  };

  /**
   * Optional authentication middleware (doesn't fail if no token)
   */
  public optionalAuth = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      const authHeader = req.headers.authorization;

      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        const user = this.authService.verifyToken(token);
        req.user = user;
      }

      next();
    } catch (error) {
      // Continue without authentication
      next();
    }
  };
}
