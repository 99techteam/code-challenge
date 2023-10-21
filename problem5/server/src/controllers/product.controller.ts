import { UserService } from "../services";
import { Request, Response } from "express";
import { CREATED, OK } from "../core/success.response";

export default class UserController {
  static async createUser(req: Request, res: Response) {
    new CREATED({
      message: "Create User successfully",
      metadata: await UserService.createUser(req, res),
    }).send(res);
  }
  static async getUser(req: Request, res: Response) {
    new OK({
      message: "Get User successfully",
      metadata: await UserService.getUser(req, res),
    }).send(res);
  }
  static async getAllUsers(req: Request, res: Response) {
    new OK({
      message: "Get all Users successfully",
      metadata: await UserService.getAllUsers(req, res),
    }).send(res);
  }

  static async updateUser(req: Request, res: Response) {
    new OK({
      message: "Update User successfully",
      metadata: await UserService.updateUser(req, res),
    }).send(res);
  }
  static async deleteUser(req: Request, res: Response) {
    new OK({
      message: "Delete User successfully",
      metadata: await UserService.deleteUser(req, res),
    }).send(res);
  }
}
