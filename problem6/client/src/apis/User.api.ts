import { http } from "@/configs";
import { PATH_API_V1, VALUES_CONSTANT } from "@/constants";
import { IUser } from "@/interfaces/models";
import { IApi, IArgsQuery } from "@/interfaces/shared";
import { getErrorMessage } from "@/utils";

export default class UserApi {
  static async getAllUser(fieldsQuery: Partial<IArgsQuery>): Promise<IApi> {
    try {
      const response = await http.get(
        `${PATH_API_V1.user.root}${PATH_API_V1.user.feature.getAllUsers}`,
        {
          params: {
            sort: fieldsQuery.sort,
            page: fieldsQuery.page,
            limit: fieldsQuery.limit,
          },
        }
      );

      const result: IApi = response.data;
      return result;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  }
  static async updatePoint(userPointUpdate: number): Promise<IApi> {
    try {
      const response = await http.patch(
        `${PATH_API_V1.user.root}${PATH_API_V1.user.feature.updatePoint}`,
        {
          user_point: userPointUpdate,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              VALUES_CONSTANT.LOCAL_STORE_NAME.AT_NAME_LOCAL_STORE
            )}`,
          },
        }
      );

      const result: IApi = response.data;
      return result;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  }
}
