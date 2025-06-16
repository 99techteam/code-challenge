import type { ICurrencySwapParams } from "@/interfaces/currency";
import { useSwapCurrencyMutation } from "@/query/use-get-currency-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CurrencySwapFormSchema } from "@/schemas/currency-swap-schema";

export const useCurrencySwap = () => {
  const [toAmount, setToAmount] = useState<number>(0);
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const {
    mutateAsync: swapCurrency,
    isPending,
    error,
    isSuccess,
  } = useSwapCurrencyMutation({});
  const {
    control,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useForm<ICurrencySwapParams>({
    resolver: zodResolver(CurrencySwapFormSchema),
    mode: "onChange",
  });

  const fromCurrency = watch("fromCurrency");
  const toCurrency = watch("toCurrency");
  const fromAmount = watch("fromAmount");

  const handleFromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const expectedToAmount = Number(value) * exchangeRate;
    setToAmount(Number(expectedToAmount.toFixed(4)));
  };

  const handleSwapCurrencies = () => {
    const tempCurrency = fromCurrency;
    const tempAmount = fromAmount;

    setValue("fromCurrency", toCurrency);
    setValue("toCurrency", tempCurrency);
    setToAmount(tempAmount);
    setValue("fromAmount", Number(toAmount));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data: ICurrencySwapParams = {
      fromCurrency,
      toCurrency,
      fromAmount: Number(fromAmount),
    };
    swapCurrency(data);
  };

  //handle exchange rate dynamically
  useEffect(() => {
    if (!fromCurrency || !toCurrency) return;
    const fromCurrencyPrice = Number(fromCurrency.split("-")[1]);
    const toCurrencyPrice = Number(toCurrency.split("-")[1]);
    const rate = fromCurrencyPrice / toCurrencyPrice;
    setExchangeRate(Number(rate.toFixed(4)));
  }, [fromCurrency, toCurrency]);
  return {
    control,
    errors,
    isValid,
    fromCurrency,
    toCurrency,
    fromAmount,
    toAmount,
    exchangeRate,
    handleFromAmountChange,
    handleSwapCurrencies,
    handleSubmit,
    isPending,
    error,
    isSuccess,
  };
};
