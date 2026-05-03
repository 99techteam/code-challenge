import { TOKEN } from "@/data/tokens"

export const tokens = Array.from(
  new Map(TOKEN.map((token) => [token.currency, token])).values(),
).sort((a, b) => a.currency.localeCompare(b.currency))

export const findTokenByCurrency = (currency: string) =>
  tokens.find((token) => token.currency === currency) ?? null
