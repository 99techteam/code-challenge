import { Request, Response } from "express";
import * as userService from "../services/user.service";
import { successResponse } from "../utils/response";

export const createUser = async (req: Request, res: Response) => {
  const user = await userService.createUser(req.body);
  return successResponse(res, user, "User created", 201);
};

export const getUsers = async (req: Request, res: Response) => {
  const users = await userService.getUsers(req.query);
  return successResponse(res, users);
};

export const getUserById = async (req: Request, res: Response) => {
  const user = await userService.getUserById(Number(req.params.id));

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  return successResponse(res, user);
};

export const updateUser = async (req: Request, res: Response) => {
  const user = await userService.updateUser(Number(req.params.id), req.body);

  return successResponse(res, user, "User updated");
};

export const deleteUser = async (req: Request, res: Response) => {
  await userService.deleteUser(Number(req.params.id));

  return successResponse(res, null, "User deleted", 204);
};
