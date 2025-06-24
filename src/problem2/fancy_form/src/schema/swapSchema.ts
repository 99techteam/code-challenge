import { z } from "zod";

export const swapSchema = z.object({
  fromAmount: z.string().refine(
    (val) => {
      const num = Number(val);
      return !isNaN(num) && num > 0;
    },
    {
      message: "Amount token from must be a number greater than 0",
    }
  ),
  toAmount: z.string().refine(
    (val) => {
      const num = Number(val);
      return !isNaN(num) && num > 0;
    },
    {
      message: "Amount token to must be a number greater than 0",
    }
  ),
});

export type SwapFormData = z.infer<typeof swapSchema>;
