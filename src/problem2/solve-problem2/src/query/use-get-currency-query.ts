import { getCurrencyPrice } from "@/api/currency";
import type { ICurrencySwapParams } from "@/interfaces/currency";
import type { IMutation } from "@/interfaces/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";

export const useGetCurrencyQuery = () => {
  return useQuery({
    queryKey: ["currency"],
    queryFn: async () => await getCurrencyPrice(),
  });
};

export const useSwapCurrencyMutation = ({
  onSuccess,
  onError,
  onSettled,
  onMutate,
}: IMutation) => {
  return useMutation({
    mutationFn: async (params: ICurrencySwapParams) =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(params);
        }, 1000);
      }),
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(error as AxiosError<{ message: string }>);
    },
    onSettled: () => {
      onSettled?.();
    },
    onMutate: () => {
      onMutate?.();
    },
  });
};
