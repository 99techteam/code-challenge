/**
 * Authentication controller for user registration and login
 */

import { Request, Response } from "express";
import { AuthService } from "../services/authService";
import { ApiResponse, CreateUserRequest, LoginRequest } from "../types";

export class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  /**
   * Register a new user
   * POST /api/auth/register
   */
  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const userData: CreateUserRequest = req.body;
      const result = await this.authService.createUser(userData);

      const response: ApiResponse<typeof result> = {
        success: true,
        message: "User registered successfully",
        data: result,
      };

      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: "Registration failed",
        error: error instanceof Error ? error.message : "Unknown error",
      };

      res.status(400).json(response);
    }
  };

  /**
   * Login user
   * POST /api/auth/login
   */
  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const loginData: LoginRequest = req.body;
      const result = await this.authService.login(loginData);

      const response: ApiResponse<typeof result> = {
        success: true,
        message: "Login successful",
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: "Login failed",
        error: error instanceof Error ? error.message : "Unknown error",
      };

      res.status(401).json(response);
    }
  };

  /**
   * Get current user profile
   * GET /api/auth/profile
   */
  public getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          message: "User not authenticated",
        };
        res.status(401).json(response);
        return;
      }

      const response: ApiResponse<typeof req.user> = {
        success: true,
        message: "Profile retrieved successfully",
        data: req.user,
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: "Failed to get profile",
        error: error instanceof Error ? error.message : "Unknown error",
      };

      res.status(500).json(response);
    }
  };
}
