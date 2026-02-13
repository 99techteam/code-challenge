import { z } from "zod";
import { ERROR_MESSAGES } from "@common";

export const exchangeSchema = z
  .object({
    fromToken: z.string().min(1, ERROR_MESSAGES.VALIDATE.MISSING_TOKEN),
    fromAmount: z
      .number({ message: ERROR_MESSAGES.VALIDATE.AMOUNT_MUST_BE_NUMBER })
      .positive(ERROR_MESSAGES.VALIDATE.AMOUNT_MUST_BE_POSITIVE),
    toToken: z.string().min(1, ERROR_MESSAGES.VALIDATE.MISSING_TOKEN),
    toAmount: z
      .number({ message: ERROR_MESSAGES.VALIDATE.AMOUNT_MUST_BE_NUMBER })
      .positive(ERROR_MESSAGES.VALIDATE.AMOUNT_MUST_BE_POSITIVE),
  })
  .refine((data) => !(!!data.toToken && data.fromToken === data.toToken), {
    message: ERROR_MESSAGES.VALIDATE.CANNOT_SWAP_SAME_TOKEN,
    path: ["toToken"],
  });

export type ExchangeFormData = z.infer<typeof exchangeSchema>;
