import { userModel } from "../models";
import { Request, Response } from "express";
import { NotFoundError, UnauthenticatedError } from "../core/error.response";
import IUser from "@/interface/model/IProduct.interface";

export default class UserService {
  static async getAllUsers(req: Request, res: Response) {
    const users = await userModel.find().limit(10).skip(0).sort("-user_point");
    return users;
  }
  static async updatePoint(req: Request, res: Response) {
    const { userId } = req.app.locals.user;
    const { user_point } = req.body as Pick<IUser, "user_point">;
    if (!userId) throw new UnauthenticatedError("Vui lòng đăng nhập");
    const user = await userModel.findById(userId);
    if (!user) throw new NotFoundError("Người dùng không tồn tại");
    await user.updateOne({
      $set: { user_point: user.user_point + user_point },
    });
    return user;
  }
}
