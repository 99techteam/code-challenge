import { create } from "zustand";

export const useCryptoStore = create((set) => ({
  crypto: null,
  setCrypto: (value) => set({ crypto: value }),
  clearCrypto: () => set({ crypto: null }),
}));
