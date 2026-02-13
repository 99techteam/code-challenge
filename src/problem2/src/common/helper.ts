import type { TokenPriceType } from "@types";
import { TOKEN_ICON_BASE_URL } from "./constants";
import { DEFAULT_LOCALE, DECIMAL_PRECISION } from "./configs";

// Helper function to get token icon URL
export const getTokenIcon = (symbol: string) =>
  `${TOKEN_ICON_BASE_URL}/${symbol}.svg`;

// Helper function to format currency amount with decimal precision
export const formatCurrencyAmount = (
  amount: number,
  maxFractionDigits = DECIMAL_PRECISION,
): string =>
  amount.toLocaleString(DEFAULT_LOCALE, {
    maximumFractionDigits: maxFractionDigits,
  });

export const getLatestPricesMap = (
  prices: TokenPriceType[],
): Record<string, TokenPriceType> => {
  // Pre-compute timestamps once
  const pricesWithTimestamp = prices.map((price) => {
    const timestamp = new Date(price.date).getTime();
    return {
      price,
      timestamp: Number.isNaN(timestamp) ? 0 : timestamp,
    };
  });

  const priceMap: Record<string, TokenPriceType> = {};
  const timestampMap: Record<string, number> = {};

  pricesWithTimestamp.forEach(({ price, timestamp }) => {
    const existingTimestamp = timestampMap[price.currency];

    if (existingTimestamp === undefined || timestamp > existingTimestamp) {
      priceMap[price.currency] = price;
      timestampMap[price.currency] = timestamp;
    }
  });

  return priceMap;
};
