/**
 * User controller - Request/Response handling
 */

import { Request, Response } from "express";
import { UserService } from "../services/userService";
import {
  ApiResponse,
  CreateUserRequest,
  UpdateUserRequest,
  UserFilters,
  PaginationParams,
} from "../types";

export class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  /**
   * Create a new user
   * POST /api/v1/users
   */
  public createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userData: CreateUserRequest = req.body;
      const newUser = await this.userService.createUser(userData);

      const response: ApiResponse<User> = {
        success: true,
        message: "User created successfully",
        data: newUser,
      };

      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: "Failed to create user",
        error: error instanceof Error ? error.message : "Unknown error",
      };

      res.status(400).json(response);
    }
  };

  /**
   * Get all users with filtering and pagination
   * GET /api/v1/users
   */
  public getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters: UserFilters = req.query;
      const pagination: PaginationParams = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
        sortBy: req.query.sortBy as keyof typeof req.query,
        sortOrder: req.query.sortOrder as "asc" | "desc",
      };

      const result = await this.userService.getUsers(filters, pagination);

      const response: ApiResponse<typeof result> = {
        success: true,
        message: "Users retrieved successfully",
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: "Failed to retrieve users",
        error: error instanceof Error ? error.message : "Unknown error",
      };

      res.status(500).json(response);
    }
  };

  /**
   * Get user by ID
   * GET /api/v1/users/:id
   */
  public getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const user = await this.userService.getUserById(id);

      if (!user) {
        const response: ApiResponse = {
          success: false,
          message: "User not found",
        };

        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<User> = {
        success: true,
        message: "User retrieved successfully",
        data: user,
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: "Failed to retrieve user",
        error: error instanceof Error ? error.message : "Unknown error",
      };

      res.status(500).json(response);
    }
  };

  /**
   * Update user by ID
   * PUT /api/v1/users/:id
   */
  public updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const updateData: UpdateUserRequest = req.body;

      const updatedUser = await this.userService.updateUser(id, updateData);

      if (!updatedUser) {
        const response: ApiResponse = {
          success: false,
          message: "User not found",
        };

        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<User> = {
        success: true,
        message: "User updated successfully",
        data: updatedUser,
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: "Failed to update user",
        error: error instanceof Error ? error.message : "Unknown error",
      };

      res.status(400).json(response);
    }
  };

  /**
   * Delete user by ID
   * DELETE /api/v1/users/:id
   */
  public deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const deleted = await this.userService.deleteUser(id);

      if (!deleted) {
        const response: ApiResponse = {
          success: false,
          message: "User not found",
        };

        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: "User deleted successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: "Failed to delete user",
        error: error instanceof Error ? error.message : "Unknown error",
      };

      res.status(500).json(response);
    }
  };

  /**
   * Get user statistics
   * GET /api/v1/users/stats
   */
  public getUserStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.userService.getUserStats();

      const response: ApiResponse<typeof stats> = {
        success: true,
        message: "User statistics retrieved successfully",
        data: stats,
      };

      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: "Failed to retrieve user statistics",
        error: error instanceof Error ? error.message : "Unknown error",
      };

      res.status(500).json(response);
    }
  };
}
