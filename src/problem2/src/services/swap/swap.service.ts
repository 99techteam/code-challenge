import { useMutation } from "@tanstack/react-query"
import type { TPriceQuote } from "@/services/price/price.type"

export const swapService = {
  executeSwap: async (quote: TPriceQuote) => {
    const response = await fetch("/api/swap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quote })
    })

    if (!response.ok) throw new Error("Swap failed")
    return response.json()
  }
}

export const useSwapMutation = () => {
  return useMutation({
    mutationFn: swapService.executeSwap
  })
}
