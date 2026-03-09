import type { Token } from "../types";

export function getExchangeRate(fromToken: Token, toToken: Token): number {
  if (!fromToken?.price || !toToken?.price) return 0;
  return fromToken.price / toToken.price;
}

export function convertAmount(
  amount: number,
  fromToken: Token,
  toToken: Token
): number {
  const rate = getExchangeRate(fromToken, toToken);
  return amount * rate;
}
