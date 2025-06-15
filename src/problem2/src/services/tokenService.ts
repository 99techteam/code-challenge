import axios from "axios";
import type { Token } from "../types";

const PRICES_URL = "https://interview.switcheo.com/prices.json";
const TOKEN_ICON_BASE_URL =
  "https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens";

export const fetchTokenPrices = async (): Promise<Token[]> => {
  try {
    const response = await axios.get<Token[]>(PRICES_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching token prices:", error);
    return [];
  }
};

export const getTokenIconUrl = (currency: string): string => {
  return `${TOKEN_ICON_BASE_URL}/${currency}.svg`;
};

export const calculateExchangeRate = (
  fromToken: Token,
  toToken: Token
): number => {
  if (!fromToken.price || !toToken.price) return 0;
  return fromToken.price / toToken.price;
};
