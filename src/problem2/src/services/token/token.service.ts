import { tokensResponseSchema } from "./token.schema"

export const tokenService = {
  getTokens: async () => {
    // Intercepted by MSW
    const response = await fetch("https://tokens.coingecko.com/uniswap/all.json")
    if (!response.ok) throw new Error("Failed to fetch tokens")
    const data = await response.json()

    return tokensResponseSchema.parse(data)
  }
}
