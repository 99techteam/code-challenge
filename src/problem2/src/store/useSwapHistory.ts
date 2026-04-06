import { create } from 'zustand'

export interface SwapHistoryEntry {
  id: string
  timestamp: number
  fromCurrency: string
  toCurrency: string
  fromAmount: string
  toAmount: string
}

interface SwapHistoryState {
  transactions: SwapHistoryEntry[]
  addTransaction: (entry: Omit<SwapHistoryEntry, 'id' | 'timestamp'>) => void
  clear: () => void
}

export const useSwapHistory = create<SwapHistoryState>(set => ({
  transactions: [],
  addTransaction: entry =>
    set(state => ({
      transactions: [
        {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          timestamp: Date.now(),
          ...entry,
        },
        ...state.transactions,
      ],
    })),
  clear: () => set({ transactions: [] }),
}))
