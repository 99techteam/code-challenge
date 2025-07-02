import type { AppState } from "@/types";
import { create } from "zustand";

export const useAppState = create<AppState>((set) => ({
  isLoading: false,
  error: null,
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (msg) => set({ error: msg }),
}));
