import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { swapFormSchema, type SwapFormData } from "@/schemas/swapSchema";

export function useSwapForm() {
  const form = useForm<SwapFormData>({
    resolver: zodResolver(swapFormSchema),
    defaultValues: {
      sellAmount: "",
      buyAmount: "",
      sellTokenSymbol: "",
      buyTokenSymbol: "",
    },
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
    reset,
    trigger,
  } = form;

  const sellAmount = watch("sellAmount");
  const buyAmount = watch("buyAmount");

  return {
    form,
    register,
    handleSubmit,
    setValue,
    watch,
    errors,
    isValid,
    reset,
    trigger,
    sellAmount,
    buyAmount,
  };
}
