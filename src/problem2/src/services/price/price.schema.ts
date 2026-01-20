import { z } from "zod"
import { tokenSchema } from "@/services/token/token.schema"

export const priceQuoteSchema = z.object({
  price: z.string(),
  guaranteedPrice: z.string(),
  to: z.string(),
  data: z.string(),
  value: z.string(),
  gas: z.string(),
  estimatedGas: z.string(),
  gasPrice: z.string(),
  protocolFee: z.string(),
  minimumProtocolFee: z.string(),
  buyTokenAddress: z.string(),
  sellTokenAddress: z.string(),
  buyAmount: z.string(),
  sellAmount: z.string(),
  allowanceTarget: z.string()
})

export const tradeSchema = z.object({
  fromAmount: z.string().optional(),
  fromToken: tokenSchema.extend({balance: z.string().nullish()}).optional(),
  toToken: tokenSchema.optional()
})

export const priceQuoteQuerySchema = z.object({
  amount: z.string().optional(),
  sellToken: tokenSchema.optional(),
  buyToken: tokenSchema.optional()
})

export const priceQuotePayloadSchema = z.object({
  sellToken: z.string(),
  buyToken: z.string(),
  sellAmount: z.string()
})

