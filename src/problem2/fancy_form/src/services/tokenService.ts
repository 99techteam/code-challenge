import type { Token } from "@/types";
import axios from "axios";

const TOKEN_PRICES_URL = "https://interview.switcheo.com/prices.json";

export const fetchTokenPrices = async (): Promise<Token[]> => {
  try {
    const response = await axios.get<Token[]>(TOKEN_PRICES_URL);
    return response.data;
  } catch (error) {
    console.error("Invalid data response:", error);
    throw new Error("Invalid data response");
  }
};

export const calculateExchangeRate = (
  fromToken: Token,
  toToken: Token
): number => {
  if (!fromToken.price || !toToken.price) return 0;
  return fromToken.price / toToken.price;
};
