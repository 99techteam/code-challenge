import type { CurrencyPrice, CurrencySwapState } from "@/types";
import { create } from "zustand";

export const useCurrencySwapStore = create<CurrencySwapState>()((set, get) => ({
  fromCurrency: null,
  toCurrency: null,
  updateFromCurrency: (by: CurrencyPrice) => set({ fromCurrency: by }),
  updateToCurrency: (by: CurrencyPrice) => set({ toCurrency: by }),
  swapCurrencies: () => {
    const { fromCurrency, toCurrency } = get();
    if (fromCurrency && toCurrency) {
      set({
        fromCurrency: toCurrency,
        toCurrency: fromCurrency,
      });
    }
  },
}));
