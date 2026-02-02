import { EXTERNAL_RESOURCES } from "../constants";
import type { Token } from "../types";

export const getTokenImageUrl = (currency: string): string => {
  return `${EXTERNAL_RESOURCES.TOKEN_ICON_BASE_URL}/${currency}.svg`;
};

export const calculateExchangeRate = (
  fromToken?: Token,
  toToken?: Token,
): number | null => {
  if (!fromToken || !toToken || toToken.price === 0) {
    return null;
  }
  return fromToken.price / toToken.price;
};

export const findTokenByCurrency = (
  tokens: Token[],
  currency: string,
): Token | undefined => {
  return tokens.find((t) => t.currency === currency);
};
