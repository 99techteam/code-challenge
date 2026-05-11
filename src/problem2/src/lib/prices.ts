import type { PriceEntry, Token } from "@/types/token"

const PRICES_URL = "https://interview.switcheo.com/prices.json"
const ICON_BASE =
  "https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens"

export function tokenIconUrl(symbol: string): string {
  return `${ICON_BASE}/${symbol}.svg`
}

/**
 * Fetches the latest price for every token from the Switcheo prices endpoint.
 *
 * The endpoint can contain multiple entries per currency and entries with
 * `price` missing or non-positive — we keep only the most recent valid price
 * per symbol and drop the rest. Tokens without a usable price are omitted.
 */
export async function fetchTokens(signal?: AbortSignal): Promise<Token[]> {
  const response = await fetch(PRICES_URL, { signal })

  if (!response.ok) {
    throw new Error(`Failed to load prices (${response.status})`)
  }

  const entries = (await response.json()) as PriceEntry[]
  const latest = new Map<string, PriceEntry>()

  for (const entry of entries) {
    if (!entry?.currency || typeof entry.price !== "number") continue
    if (!Number.isFinite(entry.price) || entry.price <= 0) continue

    const previous = latest.get(entry.currency)
    if (!previous || new Date(entry.date) > new Date(previous.date)) {
      latest.set(entry.currency, entry)
    }
  }

  return Array.from(latest.values())
    .map<Token>((entry) => ({
      symbol: entry.currency,
      price: entry.price,
      updatedAt: entry.date,
      iconUrl: tokenIconUrl(entry.currency),
    }))
    .sort((a, b) => a.symbol.localeCompare(b.symbol))
}
