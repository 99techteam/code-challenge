import { skipPage } from "../utils";
import { UserModel } from "../models";

export default class UserRepository {
  static async getUser(UserId: string) {
    return await UserModel.findById(UserId).lean().exec();
  }
  static async getAllUsers(limit: number, page: number) {
    return await UserModel
      .find()
      .limit(limit)
      .skip(skipPage({ limit, page }))
      .lean()
      .exec();
  }
  static async searchUsers(limit: number, page: number, keySearch: string) {
    // const regSearch = new RegExp(keySearch, "i");
    return await UserModel
      .find({ $text: { $search: keySearch } })
      .limit(limit)
      .skip(skipPage({ limit, page }))
      .lean()
      .exec();
  }
  static async updateUser(UserId: string, payload: any) {
    return await UserModel
      .findByIdAndUpdate(UserId, payload, { new: true })
      .lean()
      .exec();
  }

  static async deleteUser(UserId: string) {
    return await UserModel.findByIdAndDelete(UserId).lean().exec();
  }
}
