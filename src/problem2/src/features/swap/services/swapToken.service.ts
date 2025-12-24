export function getDefaultFromToken(tokens: string[]): string {
  return tokens[0] ?? "";
}

export function getDefaultToToken(tokens: string[], fromToken: string): string {
  return tokens.find((t) => t !== fromToken) ?? "";
}

export function resolveDuplicatedToken(tokens: string[], selected: string, other: string): string {
  if (selected !== other) return other;
  return tokens.find((t) => t !== selected) ?? "";
}

export interface TokenPrice {
  currency: string;
  date: string;
  price: number;
}

export function mapPricesToTokens(pricesData: TokenPrice[]): Record<string, number> {
  const tempMap: Record<string, { price: number; date: string }> = {};

  pricesData.forEach((item) => {
    const key = item.currency.toUpperCase();
    if (!tempMap[key]) tempMap[key] = { price: item.price, date: item.date };
  });

  const priceMap: Record<string, number> = {};
  Object.keys(tempMap).forEach((key) => (priceMap[key] = tempMap[key].price));
  return priceMap;
}
