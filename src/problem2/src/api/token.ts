import axios from "axios";
import type { PriceData, TokenData } from "../types/currency";

const API_URL = "https://interview.switcheo.com/prices.json";

export const fetchPrices = async (): Promise<PriceData[]> => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching prices:", error);
    throw error;
  }
};

export const getTokens = async (): Promise<TokenData[]> => {
  try {
    const priceData = await fetchPrices();

    // Deduplicate tokens by currency name, keeping the first occurrence
    const seen = new Set<string>();
    const tokens = priceData
      .filter((item) => {
        if (item.price <= 0 || seen.has(item.currency)) return false;
        seen.add(item.currency);
        return true;
      })
      .map((item) => ({
        name: item.currency,
        price: item.price,
        icon: `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${item.currency}.svg`,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return tokens;
  } catch (error) {
    console.error("Error getting tokens:", error);
    throw error;
  }
};

export const convertCurrency = (
  amount: number,
  fromPrice: number,
  toPrice: number,
): number => {
  if (!amount || !fromPrice || !toPrice) return 0;
  return (amount * fromPrice) / toPrice;
};

export const calculateExchangeRate = (
  fromPrice: number,
  toPrice: number,
): number => {
  if (!fromPrice || !toPrice) return 0;
  return fromPrice / toPrice;
};
