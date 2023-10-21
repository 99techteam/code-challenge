import { UseMutateFunction } from "@tanstack/react-query";
import { IUser } from "../models";
import { IApi } from "../shared";

export interface IAuthLoginResultApi extends IApi {
  isLogin: boolean;
  metadata: {
    user: IUser;
    accessToken: string;
  };
  login: UseMutateFunction<
    any,
    unknown,
    Pick<IUser, "user_email" | "user_password">
  >;
}

export interface IAuthRegisterResultApi extends IApi {
  isRegistering: boolean;
  metadata: {
    user: IUser;
  };
  register: UseMutateFunction<
    any,
    unknown,
    Pick<IUser, "user_name" | "user_email" | "user_password">
  >;
}
