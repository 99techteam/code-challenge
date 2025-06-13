import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";

import { Container } from "./Container.styled";
import Select from "../components/Select";
import Input from "../components/Input";
import Button from "../components/Button";

interface PriceData {
  currency: string;
  date: string;
  price: number;
}

const swapSchema = z.object({
  fromCurrency: z.string().min(1, "From currency is required"),
  toCurrency: z.string().min(1, "To currency is required"),
  amount: z
    .string()
    .refine((val) => val.trim() !== "", "Amount is required")
    .refine((val) => !isNaN(Number(val)), "Must be a number")
    .transform((val) => Number(val))
    .refine((num) => num > 0, "Amount must be greater than 0"),
});

type SwapFormValues = z.infer<typeof swapSchema>;

const CurrencySwapForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<SwapFormValues>({
    resolver: zodResolver(swapSchema),
    mode: "onChange",
    defaultValues: {
      amount: 0,
      fromCurrency: "",
      toCurrency: "",
    },
  });

  const { data: prices } = useQuery<PriceData[]>({
    queryKey: ["prices"],
    queryFn: async () => {
      const res = await fetch("https://interview.switcheo.com/prices.json");
      return res.json();
    },
  });

  const [exchangeRate, setExchangeRate] = useState(0);
  const [swapResult, setSwapResult] = useState<string | null>(null);
  const fromCurrency = watch("fromCurrency");
  const toCurrency = watch("toCurrency");

  const currencyOptions = prices ? prices.map((price) => price.currency) : [];

  useEffect(() => {
    if (prices && fromCurrency && toCurrency) {
      const fromPrice =
        prices.find((p) => p.currency === fromCurrency)?.price || 0;
      const toPrice = prices.find((p) => p.currency === toCurrency)?.price || 0;
      if (fromPrice > 0 && toPrice > 0) {
        setExchangeRate(toPrice / fromPrice);
      } else {
        setExchangeRate(0);
      }
    } else {
      setExchangeRate(0);
    }
  }, [prices, fromCurrency, toCurrency]);

  const onSubmit = (data: SwapFormValues) => {
    if (exchangeRate > 0) {
      const amount = Number(data.amount);
      const convertedAmount = (amount * exchangeRate).toFixed(4);
      setSwapResult(
        `${amount} ${data.fromCurrency} = ${convertedAmount} ${data.toCurrency}`
      );
    } else {
      setSwapResult("Invalid conversion. Please check your inputs.");
    }
  };

  return (
    <Container>
      <h2 style={{ textAlign: "center", marginBottom: "16px" }}>
        Currency Swap
      </h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Select
          placeholder="From Currency"
          options={currencyOptions}
          onChange={(value) => setValue("fromCurrency", value)}
          error={errors.fromCurrency?.message}
        />
        {errors.fromCurrency && (
          <p style={{ color: "red", margin: "4px 0" }}>
            {errors.fromCurrency.message}
          </p>
        )}

        <Select
          placeholder="To Currency"
          options={currencyOptions}
          onChange={(value) => setValue("toCurrency", value)}
          error={errors.toCurrency?.message}
        />
        {errors.toCurrency && (
          <p style={{ color: "red", margin: "4px 0" }}>
            {errors.toCurrency.message}
          </p>
        )}

        <Input
          placeholder="Amount"
          register={{
            ...register("amount", {
              onChange: (e) => {
                setValue("amount", e.target.value);
                trigger("amount");
              },
            }),
          }}
          error={errors.amount?.message}
        />
        {errors.amount && (
          <p style={{ color: "red", margin: "4px 0" }}>
            {errors.amount.message}
          </p>
        )}

        <Button
          type="primary"
          text="Convert"
          onClick={handleSubmit(onSubmit)}
        />

        {exchangeRate > 0 && (
          <p style={{ textAlign: "center", marginTop: "8px" }}>
            Exchange Rate: 1 {fromCurrency} = {exchangeRate.toFixed(4)}{" "}
            {toCurrency}
          </p>
        )}

        {swapResult && (
          <div
            style={{
              marginTop: "16px",
              padding: "12px",
              backgroundColor: "#f0f0f0",
              borderRadius: "4px",
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            {swapResult}
          </div>
        )}
      </form>
    </Container>
  );
};

export default CurrencySwapForm;
