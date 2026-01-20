import { useQuery } from "@tanstack/react-query"
import invariant from "tiny-invariant"
import { toTokenAmount } from "@/lib/number"
import type { TPriceQuoteQuery } from "@/services/price/price.type"
import { priceService } from "./price.service"

export const useQuoteQuery = ({ sellToken, buyToken, amount }: TPriceQuoteQuery) => {
  return useQuery({
    queryKey: ["quote", sellToken?.address, buyToken?.address, amount],
    queryFn: async () => {
      invariant(sellToken)
      invariant(buyToken)
      invariant(amount)

      const parsedAmount = parseFloat(amount)
      if (parsedAmount < 0) return

      const sellAmount = toTokenAmount(amount, sellToken.decimals)

      return priceService.getQuote({
        sellToken: sellToken.address,
        buyToken: buyToken.address,
        sellAmount
      })
    },
    enabled: Boolean(sellToken && buyToken && amount && parseFloat(amount) > 0)
  })
}
