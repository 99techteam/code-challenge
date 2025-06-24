import { useForm } from "react-hook-form";
import { useCallback, useEffect, useState } from "react";
import { convertPrice } from "@/lib/convertPrice";
import type { Token } from "@/types";
import { swapSchema } from "@/schema/swapSchema";
import { zodResolver } from "@hookform/resolvers/zod";

interface SwapFormData {
  fromAmount: string;
  toAmount: string;
}

export const useSwapAmountSync = (
  tokenFrom: Token | null,
  tokenTo: Token | null
) => {
  const [lastEditedField, setLastEditedField] = useState<"from" | "to" | null>(
    null
  );
  const [isConverting, setIsConverting] = useState(false);

  const {
    control,
    watch,
    setValue,
    reset,
    handleSubmit,
    trigger,
    clearErrors,
    formState: { errors },
  } = useForm<SwapFormData>({
    resolver: zodResolver(swapSchema),
    mode: "onChange",
    criteriaMode: "all",
    defaultValues: {
      fromAmount: "",
      toAmount: "",
    },
  });

  const fromAmount = watch("fromAmount");
  const toAmount = watch("toAmount");

  const handleConversion = useCallback(
    async (
      source: "from" | "to",
      amountStr: string,
      tokenA: Token | null,
      tokenB: Token | null
    ) => {
      if (isConverting) return; // Prevent multiple conversions

      const amount = parseFloat(amountStr);
      const targetField = source === "from" ? "toAmount" : "fromAmount";

      if (!tokenA || !tokenB || isNaN(amount) || amount <= 0) {
        setValue(targetField, "");
        return;
      }

      setIsConverting(true);

      const converted =
        source === "from"
          ? convertPrice(tokenA, tokenB, amount)
          : convertPrice(tokenB, tokenA, amount);

      const convertedValue = converted?.toString() ?? "";
      setValue(targetField, convertedValue);

      // Clear errors for the converted field và trigger validation
      if (convertedValue) {
        clearErrors(targetField);
        setTimeout(async () => {
          await trigger();
          setIsConverting(false);
        }, 0);
      } else {
        setIsConverting(false);
      }
    },
    [setValue, trigger, clearErrors, isConverting]
  );

  useEffect(() => {
    if (lastEditedField === "from") {
      handleConversion("from", fromAmount, tokenFrom, tokenTo);
    }
  }, [fromAmount, tokenFrom, tokenTo, lastEditedField, handleConversion]);

  useEffect(() => {
    if (lastEditedField === "to") {
      handleConversion("to", toAmount, tokenFrom, tokenTo);
    }
  }, [toAmount, tokenFrom, tokenTo, lastEditedField, handleConversion]);

  const customIsValid =
    tokenFrom &&
    tokenTo &&
    fromAmount &&
    toAmount &&
    !isNaN(parseFloat(fromAmount)) &&
    !isNaN(parseFloat(toAmount)) &&
    parseFloat(fromAmount) > 0 &&
    parseFloat(toAmount) > 0;

  return {
    control,
    fromAmount,
    toAmount,
    setLastEditedField,
    reset,
    errors,
    isValid: customIsValid,
    handleSubmit,
  };
};
