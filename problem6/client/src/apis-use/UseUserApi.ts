import { useMutation, useQuery } from "@tanstack/react-query";
import UserApi from "@/apis/User.api";
import {
  IUserGetAllUsersResultApi,
  IUserUpdateUsersResultApi,
} from "@/interfaces/result-api/IResultUserApi";
import { useQueriesString } from "@/hooks";
import toast from "react-hot-toast";

export default class UseAuthApi {
  static getAllUsers(): IUserGetAllUsersResultApi {
    const queriesString = useQueriesString();

    const { data, isPending } = useQuery({
      queryKey: ["users"],
      queryFn: () =>
        UserApi.getAllUser({
          limit: queriesString.limit,
          page: queriesString.page,
          sort: queriesString.sort,
        }),
    });

    return {
      isGettingAllUsers: isPending,
      message: data?.message,
      metadata: data?.metadata,
      statusCode: data?.statusCode,
      reasonStatusCode: data?.reasonStatusCode,
    };
  }
  static updatePoint(): IUserUpdateUsersResultApi {
    const { data, mutate, isPending } = useMutation({
      mutationFn: UserApi.updatePoint,
      onSuccess: (data) => {
        toast.success(data?.message);
      },
      onError: (error: any) => {
        toast.error(error?.message);
      },
    });

    return {
      updatePoint: mutate,
      isUpdatingPoint: isPending,
      message: data?.message,
      metadata: data?.metadata,
      statusCode: data?.statusCode,
      reasonStatusCode: data?.reasonStatusCode,
    };
  }
}
