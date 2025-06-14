import { z } from 'zod';

export const CurrencySwapSchema = z.object({
  fromAmount: z
    .string()
    .min(1, 'Amount is required.')
    .refine((val) => !isNaN(Number(val)), {
      message: 'Amount must be a number.',
    })
    .refine((val) => Number(val) > 0, {
      message: 'Amount must be greater than 0.',
    }),
});

export type CurrencySwapForm = z.infer<typeof CurrencySwapSchema>;
