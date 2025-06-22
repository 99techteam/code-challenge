import { IToken } from "@types/token";

export const convertPrice = (
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  tokens: IToken[],
): number | null => {
  const fromCoin = tokens?.find((token) => token.currency === fromCurrency);
  const toCoin = tokens?.find((token) => token.currency === toCurrency);

  if (!fromCoin || !toCoin) {
    return null;
  }

  const baseAmount = amount / fromCoin.price;
  const convertedAmount = baseAmount * toCoin.price;

  return convertedAmount;
};
