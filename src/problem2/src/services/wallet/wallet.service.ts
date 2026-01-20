import { create } from "zustand"

interface WalletState {
  address: string | null
  chainId: number | null
  isConnected: boolean
  connect: (address: string, chainId: number) => void
  disconnect: () => void
}

export const useWalletStore = create<WalletState>(set => ({
  address: null,
  chainId: null,
  isConnected: false,
  connect: (address, chainId) => set({ address, chainId, isConnected: true }),
  disconnect: () => set({ address: null, chainId: null, isConnected: false })
}))

export const walletService = {
  connect: async () => {
    const response = await fetch("/api/wallet/connect", { method: "POST" })
    if (!response.ok) throw new Error("Failed to connect")
    return response.json()
  },

  disconnect: async () => {
    const response = await fetch("/api/wallet/disconnect", { method: "POST" })
    if (!response.ok) throw new Error("Failed to disconnect")
    return response.json()
  },

  getBalances: async () => {
    const response = await fetch("/api/wallet/balances")
    if (!response.ok) throw new Error("Failed to fetch balances")
    return response.json()
  }
}
