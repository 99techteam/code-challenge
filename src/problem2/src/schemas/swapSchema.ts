import { z } from "zod";

const createAmountSchema = (
  fieldName: string,
  includeMaxValidation = false
) => {
  const baseSchema = z
    .union([z.string(), z.null()])
    .transform((val) => val ?? "")
    .refine(
      (val) => val.length > 0,
      `${fieldName} amount must be a valid positive number`
    )
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    }, `${fieldName} amount must be a valid positive number`);

  if (includeMaxValidation) {
    return baseSchema.refine((val) => {
      const num = parseFloat(val);
      return num <= 999999999; // Max reasonable amount
    }, `${fieldName} amount is too large`);
  }

  return baseSchema;
};

export const swapFormSchema = z
  .object({
    sellAmount: createAmountSchema("Sell", true),
    buyAmount: createAmountSchema("Buy"),
    sellTokenSymbol: z.string().min(1, "Please select a token to sell"),
    buyTokenSymbol: z.string().min(1, "Please select a token to buy"),
  })
  .refine(
    (data) => {
      return data.sellTokenSymbol !== data.buyTokenSymbol;
    },
    {
      message: "Cannot swap the same token",
      path: ["buyTokenSymbol"], // Show error on buy token field
    }
  )
  .refine(
    (data) => {
      // Custom validation to check minimum swap amount
      const sellAmount = parseFloat(data.sellAmount);
      return sellAmount >= 0.0001; // Minimum swap amount
    },
    {
      message: "Minimum swap amount is 0.0001",
      path: ["sellAmount"],
    }
  );

export type SwapFormData = z.infer<typeof swapFormSchema>;

// Additional validation functions
export const validateBalance = (amount: string, balance: string): boolean => {
  const amountNum = parseFloat(amount);
  const balanceNum = parseFloat(balance);
  return !isNaN(amountNum) && !isNaN(balanceNum) && amountNum <= balanceNum;
};

export const validateMinAmount = (
  amount: string,
  minAmount: number = 0.0001
): boolean => {
  const amountNum = parseFloat(amount);
  return !isNaN(amountNum) && amountNum >= minAmount;
};

export const validateMaxAmount = (
  amount: string,
  maxAmount: number = 1000000
): boolean => {
  const amountNum = parseFloat(amount);
  return !isNaN(amountNum) && amountNum <= maxAmount;
};
