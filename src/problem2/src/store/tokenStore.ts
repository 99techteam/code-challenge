import tokenService from "@/services/tokenService";
import type { TokenPrice, TokenStore } from "@/types";
import { create } from "zustand";

export const useTokenStore = create<TokenStore>((set) => ({
  tokens: [],
  loading: false,

  fetchTokens: async () => {
    set({ loading: true });

    try {
      const rawData = await tokenService.getTokenData();

      const tokens: TokenPrice[] = rawData
        .filter((item: any) => typeof item.price === "number" && item.currency)
        .map((item: any) => ({
          symbol: item.currency,
          price: item.price,
          logoURI: `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${item.currency}.svg`,
        }));

      set({ tokens });
    } catch (error) {
      console.error("Failed to fetch token prices:", error);
    } finally {
      set({ loading: false });
    }
  },
}));
