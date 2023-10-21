import { UseMutateFunction } from "@tanstack/react-query";
import { IUser } from "../models";
import { IApi } from "../shared";

export interface IUserGetAllUsersResultApi extends IApi {
  isGettingAllUsers: boolean;
  metadata: Array<IUser>;
}

export interface IUserUpdateUsersResultApi extends IApi {
  isUpdatingPoint: boolean;
  metadata: {
    user: IUser;
  };
  updatePoint: UseMutateFunction<any, unknown, number>;
}
