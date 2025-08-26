import { useMutation } from "@tanstack/react-query";

import toast from "react-hot-toast";
import { convertCurrency } from "../services/apiService";

export function useConvertCurrency() {
  const { mutate, isPending, isSuccess, data, error } = useMutation({
    mutationFn: convertCurrency,
    onSuccess: (data) => {
      toast.success(
        `Converted successfully: ${data.amount} ${data.from} = ${data.converted} ${data.to}`
      );
    },
    onError: (error) => {
      toast.error(
        `Conversion failed: ${error.response?.data?.error || error.message}`
      );
    },
  });
  return { mutate, isPending, isSuccess, data, error };
}
