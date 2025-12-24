import { z } from "zod";

const DECIMAL_LIMIT = 18;
const SLIPPAGE_DECIMAL_LIMIT = 2;

export const swapSchema = z.object({
  fromAmount: z
    .string()
    .refine(
      (val) => /^\d*\.?\d*$/.test(val) && Number(val) > 0,
      "Amount must be greater than 0"
    )
    .refine((val) => {
      if (!val.includes(".")) return true;
      return val.split(".")[1].length <= DECIMAL_LIMIT;
    }, `Max ${DECIMAL_LIMIT} decimals allowed`),
  slippage: z
    .string()
    .refine(
      (val) => /^\d*\.?\d*$/.test(val) && Number(val) >= 0,
      "Must be a valid positive number"
    )
    .refine((val) => {
      if (!val.includes(".")) return true;
      return val.split(".")[1].length <= SLIPPAGE_DECIMAL_LIMIT;
    }, `Max ${SLIPPAGE_DECIMAL_LIMIT} decimals for slippage`),
});

export type SwapForm = z.infer<typeof swapSchema>;
