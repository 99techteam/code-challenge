import { http } from "@/configs";
import { PATH_API_V1 } from "@/constants";
import { IUser } from "@/interfaces/models";
import { IApi } from "@/interfaces/shared";
import { getErrorMessage } from "@/utils";

export default class AuthApi {
  static async register(
    args: Pick<IUser, "user_name" | "user_email" | "user_password">
  ): Promise<IApi> {
    try {
      const response = await http.post(
        `${PATH_API_V1.auth.root}${PATH_API_V1.auth.feature.register}`,
        args
      );
      const result: IApi = response.data;
      return result;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  }

  static async login(
    args: Pick<IUser, "user_email" | "user_password">
  ): Promise<IApi> {
    try {
      const response = await http.post(
        `${PATH_API_V1.auth.root}${PATH_API_V1.auth.feature.login}`,
        args
      );

      const result: IApi = response.data;
      return result;
    } catch (error: any) {
      console.log("error:::", error);
      throw new Error(getErrorMessage(error));
    }
  }
}
