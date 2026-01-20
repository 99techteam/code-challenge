import type { z } from "zod"
import type {
  priceQuotePayloadSchema,
  priceQuoteQuerySchema,
  priceQuoteSchema,
  tradeSchema
} from "@/services/price/price.schema"

export type TPriceQuote = z.infer<typeof priceQuoteSchema>
export type TPriceQuoteQuery = z.infer<typeof priceQuoteQuerySchema>
export type TPriceQuotePayload = z.infer<typeof priceQuotePayloadSchema>

export type TTrade = z.infer<typeof tradeSchema>
