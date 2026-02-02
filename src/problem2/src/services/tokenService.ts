import axios from "axios";
import { API_ENDPOINTS } from "../constants";
import { getTokenImageUrl } from "../utils/tokenHelpers";
import type { Token, TokenPrice } from "../types";

export const fetchTokenPrices = async (): Promise<TokenPrice[]> => {
  try {
    const response = await axios.get<TokenPrice[]>(API_ENDPOINTS.PRICES);
    return response.data;
  } catch (error) {
    console.error("Error fetching token prices:", error);
    throw new Error("Failed to fetch token prices");
  }
};

export const processTokenPrices = (prices: TokenPrice[]): Token[] => {
  const priceMap = new Map<string, number>();

  prices.forEach((item) => {
    if (item.price > 0) {
      const existing = priceMap.get(item.currency);
      if (!existing || item.price > 0) {
        priceMap.set(item.currency, item.price);
      }
    }
  });

  const tokenList: Token[] = Array.from(priceMap.entries())
    .map(([currency, price]) => ({
      currency,
      price,
      imageUrl: getTokenImageUrl(currency),
    }))
    .sort((a, b) => a.currency.localeCompare(b.currency));

  return tokenList;
};

export const getTokensWithPrices = async (): Promise<Token[]> => {
  const prices = await fetchTokenPrices();
  return processTokenPrices(prices);
};
