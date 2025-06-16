import { z } from "zod";

export const CurrencySwapFormSchema = z.object({
  fromAmount: z.coerce
    .number()
    .positive("Amount must be greater than 0")
    .min(0, { message: "Required" }),
  fromCurrency: z.string().min(1, { message: "Required" }),
  toCurrency: z.string().min(1, { message: "Required" }),
});
