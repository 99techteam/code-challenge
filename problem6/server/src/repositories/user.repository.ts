import { userModel } from "../models";

export default class UserRepository {
  static async getUserByEmail(userEmail: string) {
    return await userModel
      .findOne({ user_email: userEmail })
      .select("+user_password")
      .exec();
  }
}
