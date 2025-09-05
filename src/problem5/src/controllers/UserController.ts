/**
 * User controller for handling HTTP requests
 */

import { Request, Response } from "express";
import { UserService } from "../services/UserService";
import {
  ApiResponse,
  CreateUserRequest,
  UpdateUserRequest,
  UserFilters,
  User,
} from "../types";

export class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  /**
   * Create a new user
   * POST /api/users
   */
  public createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userData: CreateUserRequest = req.body;
      const user = await this.userService.createUser(userData);

      const response: ApiResponse<User> = {
        success: true,
        message: "User created successfully",
        data: user,
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
   * Get all users with filters and pagination
   * GET /api/users
   */
  public getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters: UserFilters = {
        name: req.query.name as string,
        email: req.query.email as string,
        minAge: req.query.minAge
          ? parseInt(req.query.minAge as string)
          : undefined,
        maxAge: req.query.maxAge
          ? parseInt(req.query.maxAge as string)
          : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const { users, total } = await this.userService.getUsers(filters);
      const totalPages = Math.ceil(total / filters.limit!);

      const response: ApiResponse<User[]> = {
        success: true,
        message: "Users retrieved successfully",
        data: users,
        pagination: {
          page: filters.page!,
          limit: filters.limit!,
          total,
          totalPages,
        },
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
   * GET /api/users/:id
   */
  public getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        const response: ApiResponse = {
          success: false,
          message: "Invalid user ID",
          error: "User ID must be a number",
        };
        res.status(400).json(response);
        return;
      }

      const user = await this.userService.getUserById(id);

      if (!user) {
        const response: ApiResponse = {
          success: false,
          message: "User not found",
          error: "No user found with the provided ID",
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
   * Update user
   * PUT /api/users/:id
   */
  public updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        const response: ApiResponse = {
          success: false,
          message: "Invalid user ID",
          error: "User ID must be a number",
        };
        res.status(400).json(response);
        return;
      }

      const userData: UpdateUserRequest = req.body;
      const user = await this.userService.updateUser(id, userData);

      if (!user) {
        const response: ApiResponse = {
          success: false,
          message: "User not found",
          error: "No user found with the provided ID",
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<User> = {
        success: true,
        message: "User updated successfully",
        data: user,
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
   * Delete user
   * DELETE /api/users/:id
   */
  public deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        const response: ApiResponse = {
          success: false,
          message: "Invalid user ID",
          error: "User ID must be a number",
        };
        res.status(400).json(response);
        return;
      }

      const deleted = await this.userService.deleteUser(id);

      if (!deleted) {
        const response: ApiResponse = {
          success: false,
          message: "User not found",
          error: "No user found with the provided ID",
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
}
