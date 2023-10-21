import { UserService } from "../services";
import { Request, Response } from "express";
import { OK } from "../core/success.response";

export default class UserController {
  static async updatePoint(req: Request, res: Response) {
    new OK({
      message: "Update score successfully",
      metadata: await UserService.updatePoint(req, res),
    }).send(res);
  }
  static async getAllUsers(req: Request, res: Response) {
    new OK({
      message: "Get all user successfully",
      metadata: await UserService.getAllUsers(req, res),
    }).send(res);
  }
}
