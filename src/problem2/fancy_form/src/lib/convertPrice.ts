import type { Token } from "@/types";

// Function to convert price
export const convertPrice = (
  fromToken: Token,
  toToken: Token,
  amount: number
): number | null => {
  const fromPrice = fromToken.price;
  const toPrice = toToken.price;

  if (
    fromPrice === null ||
    toPrice === null ||
    fromPrice <= 0 ||
    toPrice <= 0
  ) {
    console.error(
      `Invalid price for ${
        fromPrice === null || fromPrice <= 0
          ? fromToken.currency
          : toToken.currency
      }`
    );
    return null;
  }

  const convertedAmount = (amount * fromPrice) / toPrice;
  return convertedAmount;
};
