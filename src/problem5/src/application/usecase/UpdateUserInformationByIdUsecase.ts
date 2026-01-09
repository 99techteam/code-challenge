import { User } from "../controller/User";
import * as schema from "../../domain/schema";
import { DateTime } from "luxon";

export class UpdateUserInformationByIdUsecase {

  async updateUserInformationById(id: string, payload: schema.IUserData): Promise<schema.IStoredUser | null> {
    const user = new User();
    const currentDateTime = DateTime.local();
    const userInfromation: schema.IUserData = {
      ...payload,
      updatedAt: currentDateTime.toISO()
    };
    return await user.updateUserInformation(id, userInfromation);
  }

  async deleteUserById(id: string): Promise<boolean> {
    try {
      const user = new User();
      await user.deleteUserById(id);
      return true;
    } catch (error) {
      return false;
    }
  }
}
