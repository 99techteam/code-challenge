import { priceClient } from "@api/client";
import { API_ENDPOINTS } from "@common";
import type { TokenPriceType } from "@types";

export const priceService = {
  getTokenPrice: async (): Promise<TokenPriceType[]> => {
    // Simulate an API call to fetch token price
    try {
      const response = await priceClient.get(API_ENDPOINTS.PRICES);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch token prices", error);
      throw error;
    }
  },
};
