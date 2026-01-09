import { User } from "../controller/User";
import * as schema from "../../domain/schema";
import { DateTime } from "luxon";

export class StoreUserInformationUsecase {

  async storeUserInformation(payload: schema.IUserData): Promise<schema.IStoredUser | null> {
    const user = new User();
    const currentDateTime = DateTime.local();
    const userInfromation: schema.IUserData = {
      ...payload,
      updatedAt: currentDateTime.toISO()
    };
    const userData = await user.storeUserInformation(userInfromation);
    return userData;
  }
}
