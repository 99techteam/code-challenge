import { create } from "zustand";
import type { Token } from "../types/prices";

type Action = {
  tokenSearchQuery: string;
  selectedToken: {
    to: Token | null;
    from: Token | null;
  };
  fromAmount: string;
  error: string;
};

type Actions = {
  setTokenSearchQuery: (query: string) => void;
  setToken: (token: { to: Token | null; from: Token | null }) => void;
  setFromAmount: (amount: string) => void;
  setError: (error?: string) => void;
};

const tokenStore = create<Action & Actions>((set) => ({
  tokenSearchQuery: "",
  selectedToken: {
    to: null,
    from: null,
  },
  fromAmount: "",
  error: "",
  setError: (error?: string) => set({ error }),
  setFromAmount: (amount: string) => set({ fromAmount: amount }),
  setTokenSearchQuery: (query: string) => set({ tokenSearchQuery: query }),
  setToken: (token: { to: Token | null; from: Token | null }) =>
    set((state) => ({ ...state, selectedToken: token })),
}));

export default tokenStore;
