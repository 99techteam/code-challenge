import { z } from "zod"

export const tokenSchema = z.object({
  chainId: z.number(),
  address: z.string(),
  name: z.string(),
  symbol: z.string(),
  decimals: z.number(),
  logoURI: z.string().optional()
})

export const tokensResponseSchema = z.object({
  tokens: z.array(tokenSchema)
})