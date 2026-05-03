import { create } from "zustand";
import axios, { AxiosError } from "axios";

// Type Imports
import type { CurrencyState } from "./currenciestype";

// Util Imports
import { API_CONFIG, DEFAULT_CURRENCIES } from "@utils/constants";

// Retry logic for API calls
const fetchWithRetry = async <T,>(
  url: string,
  retries = API_CONFIG.RETRY_ATTEMPTS
): Promise<T> => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get<T>(url, {
        timeout: API_CONFIG.TIMEOUT,
      });
      return response.data;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) =>
        setTimeout(resolve, API_CONFIG.RETRY_DELAY * (i + 1))
      );
    }
  }
  throw new Error("Failed to fetch after retries");
};

export const useCurrencyStore = create<CurrencyState>((set) => ({
  fromCurrency: DEFAULT_CURRENCIES.FROM,
  toCurrency: DEFAULT_CURRENCIES.TO,
  amount: 1,
  priceData: {},
  isLoading: false,
  error: null,

  setFromCurrency: (currency: string) =>
    set(() => ({ fromCurrency: currency })),

  setToCurrency: (currency: string) => set(() => ({ toCurrency: currency })),

  setAmount: (amount: number) => set(() => ({ amount })),

  setPriceData: (data: Record<string, number>) =>
    set(() => ({ priceData: data })),

  setLoading: (loading: boolean) => set(() => ({ isLoading: loading })),

  setError: (error: string | null) => set(() => ({ error })),

  fetchPriceData: async () => {
    set({ isLoading: true, error: null });

    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.PRICES_ENDPOINT}`;
      const data = await fetchWithRetry<
        Array<{ currency: string; price: number }>
      >(url);

      if (data && Array.isArray(data)) {
        const priceData = data.reduce(
          (
            acc: { [key: string]: number },
            item: { currency: string; price: number }
          ) => {
            if (item.currency && item.price !== undefined && item.price !== null) {
              acc[item.currency] = item.price;
            }
            return acc;
          },
          {}
        );

        set({ priceData, isLoading: false, error: null });
      } else {
        throw new Error("Invalid data format received");
      }
    } catch (error) {
      let errorMessage = "Failed to fetch price data";
      
      if (error instanceof AxiosError) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      console.error("Failed to fetch price data:", error);
      set({
        isLoading: false,
        error: errorMessage,
      });
    }
  },
}));
