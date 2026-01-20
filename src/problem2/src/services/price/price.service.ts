import type { TPriceQuotePayload } from "@/services/price/price.type"
import { priceQuoteSchema } from "./price.schema"

export const priceService = {
  getQuote: async ({ sellToken, buyToken, sellAmount }: TPriceQuotePayload) => {
    const searchParams = new URLSearchParams({
      sellToken,
      buyToken,
      sellAmount
    })

    const response = await fetch(`https://api.0x.org/swap/v1/quote?${searchParams.toString()}`)
    if (!response.ok) throw new Error("Failed to fetch quote")
    const data = await response.json()

    return priceQuoteSchema.parse(data)
  }
}
