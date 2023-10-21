import { userModel } from "../models";
import { Request, Response } from "express";
import { BadRequestError, NotFoundError } from "../core/error.response";
import IUser from "../interface/model/IProduct.interface";
import { UserRepository } from "../repositories";
import bcrypt from "bcrypt";
import JWT from "jsonwebtoken";
import { env } from "process";

export default class AuthService {
  static async register(req: Request, res: Response) {
    const { user_name, user_email, user_password } = req.body as IUser;
    if (!user_name || !user_email || !user_password)
      throw new BadRequestError("Vui lòng điền đủ thông tin đăng ký");
    const dataCreate = {
      user_name,
      user_email,
      user_password,
    };
    const newUser = await userModel.create(dataCreate);
    return newUser;
  }

  static async login(req: Request, res: Response) {
    const { user_email, user_password } = req.body as IUser;

    const user = await UserRepository.getUserByEmail(user_email);
    if (!user) throw new NotFoundError("Email người dùng không tồn tại!");

    const isMatchingPassword = await bcrypt.compare(
      user_password,
      user.user_password
    );
    if (!isMatchingPassword) throw new BadRequestError("Mật khẩu không đúng!");

    const payload = {
      userId: user._id,
      userName: user.user_name,
      userEmail: user.user_email,
    };

    const SECRET_KEY_TOKEN = env.SECRET_KEY_TOKEN || "";

    const newAT = JWT.sign(payload, SECRET_KEY_TOKEN, {
      algorithm: "HS256",
      expiresIn: "1h",
    });

    return {
      user: {
        _id: user._id,
        user_name: user.user_name,
        user_email: user.user_email,
        user_point: user.user_point,
      },
      accessToken: newAT,
    };
  }

  static async logout(req: Request, res: Response) {}

  static async resetPassword(req: Request, res: Response) {
    const { userId } = req.app.locals.user;
    const { user_password } = req.body as IUser;

    const user = await userModel.findById(userId);
    if (!user) throw new NotFoundError("Người dùng không tồn tại");
    await user.updateOne({
      $set: { user_password: bcrypt.hash(user_password, 10) },
    });
    return user;
  }
}
