import { UserModel } from "../models";
import { Request, Response } from "express";
import { IUser, IQuery } from "../interface";
import { UserRepository } from "../repositories";
import { BadRequestError, NotFoundError } from "../core/error.response";

export default class UserService {
  static async createUser(req: Request, res: Response) {
    const payload = req.body as IUser;
    const newUser = await UserModel.create(payload);
    return newUser;
  }

  static async getUser(req: Request, res: Response) {
    const { UserId } = req.params;
    const User = await UserRepository.getUser(UserId);
    if (!User) throw new NotFoundError("Sản phẩm không tồn tại");
    return User;
  }

  static async getAllUsers(req: Request, res: Response) {
    const { limit, page } = req.query as unknown as IQuery;
    const Users = await UserRepository.getAllUsers(limit, page);
    return Users;
  }

  static async updateUser(req: Request, res: Response) {
    const { UserId } = req.params;
    const payload = req.body;
    const UserUpdated = await UserRepository.updateUser(
      UserId,
      payload
    );
    if (!UserUpdated)
      throw new NotFoundError("Không tìm thấy sản phẩm để cập nhật");
    return UserUpdated;
  }

  static async deleteUser(req: Request, res: Response) {
    const { UserId } = req.params;
    const UserDeleted = await UserRepository.deleteUser(UserId);
    if (!UserDeleted)
      throw new NotFoundError("Không tìm thấy sản phẩm để xóa");
    return UserDeleted;
  }
}

// module.exports = UserService;
