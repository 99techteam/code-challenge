import { AuthService } from "../services";
import { Request, Response } from "express";
import { CREATED, OK } from "../core/success.response";

export default class UserController {
  static async register(req: Request, res: Response) {
    new CREATED({
      message: "Register successfully",
      metadata: await AuthService.register(req, res),
    }).send(res);
  }
  static async login(req: Request, res: Response) {
    new OK({
      message: "Login successfully",
      metadata: await AuthService.login(req, res),
    }).send(res);
  }
  static async logout(req: Request, res: Response) {
    new OK({
      message: "Logout successfully",
      metadata: await AuthService.logout(req, res),
    }).send(res);
  }
  static async resetPassword(req: Request, res: Response) {
    new OK({
      message: "Reset password successfully",
      metadata: await AuthService.resetPassword(req, res),
    }).send(res);
  }
}
