import { z } from 'zod';

export const swapFormSchema = z.object({
  fromToken: z.string().min(1, 'Please select a token to swap from'),
  toToken: z.string().min(1, 'Please select a token to swap to'),
  fromAmount: z
    .string()
    .min(1, 'Enter an amount')
    .refine(
      (val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num > 0;
      },
      { message: 'Amount must be a positive number' }
    )
    .refine(
      (val) => {
        const num = parseFloat(val);
        return num <= 1000000; // Maximum 1M tokens
      },
      { message: 'Amount is too large' }
    ),
}).refine(
  (data) => data.fromToken !== data.toToken,
  {
    message: 'Cannot swap the same token',
    path: ['toToken'],
  }
);

export type SwapFormData = z.infer<typeof swapFormSchema>;