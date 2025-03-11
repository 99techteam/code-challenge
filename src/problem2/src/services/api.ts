import axios from "axios";

const API_BASE_URL = "https://interview.switcheo.com";

export interface Token {
  currency: string;
  date: string;
  price: number;
}

export type TokenPrices = Token[];

export const fetchTokenPrices = async (): Promise<TokenPrices> => {
  try {
    const response = await axios.get<TokenPrices>(
      `${API_BASE_URL}/prices.json`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching token prices:", error);
    throw error;
  }
};
