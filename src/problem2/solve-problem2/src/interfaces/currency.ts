import { z } from "zod";
import { CurrencySwapFormSchema } from "@/schemas/currency-swap-schema";

export interface ICurrency {
  currency: string;
  date: string;
  price: number;
}

export type ICurrencySwapParams = z.infer<typeof CurrencySwapFormSchema>;
