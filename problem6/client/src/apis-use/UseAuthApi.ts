import AuthApi from "@/apis/Auth.api";
import {
  IAuthLoginResultApi,
  IAuthRegisterResultApi,
} from "@/interfaces/result-api/IResultAuthApi";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";

export default class UseAuthApi {
  static register(): IAuthRegisterResultApi {
    const { data, mutate, isPending } = useMutation({
      mutationFn: AuthApi.register,
      onSuccess: (data) => {
        toast.success(data?.message);
      },
      onError: (error: any) => {
        toast.error(error?.message);
      },
    });

    return {
      register: mutate,
      isRegistering: isPending,
      message: data?.message,
      metadata: data?.metadata,
      statusCode: data?.statusCode,
      reasonStatusCode: data?.reasonStatusCode,
    };
  }
  static login(): IAuthLoginResultApi {
    const { data, mutate, isPending } = useMutation({
      mutationFn: AuthApi.login,
      onSuccess: (data) => {
        toast.success(data?.message);
      },
      onError: (error: any) => {
        toast.error(error?.message);
      },
    });

    return {
      login: mutate,
      isLogin: isPending,
      message: data?.message,
      metadata: data?.metadata,
      statusCode: data?.statusCode,
      reasonStatusCode: data?.reasonStatusCode,
    };
  }
}
