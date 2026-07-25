import type { PriceRecord, Token } from '../types'

const ICON_BASE = 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens'

/** Remote SVG icon URL for a given currency symbol. */
export function iconUrlFor(symbol: string): string {
  return `${ICON_BASE}/${symbol}.svg`
}

/**
 * Deterministic pseudo-random mocked wallet balance derived from the symbol,
 * scaled so that pricier tokens hold fewer units. Stable across renders.
 */
function mockBalanceFor(symbol: string, price: number): number {
  let hash = 0
  for (let i = 0; i < symbol.length; i++) {
    hash = (hash * 31 + symbol.charCodeAt(i)) % 100000
  }
  const usdBudget = 500 + (hash % 9500) // between $500 and $10,000 of holdings
  return price > 0 ? usdBudget / price : 0
}

/**
 * Convert raw price records into a sorted, de-duplicated list of tradable
 * tokens. Records without a positive price are omitted. When a currency appears
 * multiple times, the record with the latest `date` wins.
 */
export function buildTokens(records: PriceRecord[]): Token[] {
  const latest = new Map<string, PriceRecord>()
  for (const r of records) {
    if (!r || typeof r.price !== 'number' || !(r.price > 0)) continue
    const existing = latest.get(r.currency)
    if (!existing || new Date(r.date).getTime() >= new Date(existing.date).getTime()) {
      latest.set(r.currency, r)
    }
  }
  return Array.from(latest.values())
    .map((r) => ({
      symbol: r.currency,
      price: r.price,
      iconUrl: iconUrlFor(r.currency),
      balance: mockBalanceFor(r.currency, r.price),
    }))
    .sort((a, b) => a.symbol.localeCompare(b.symbol))
}

/**
 * Exchange rate: how many units of `to` you receive for 1 unit of `from`,
 * computed via their shared USD prices.
 */
export function exchangeRate(from: Token, to: Token): number {
  if (!from || !to || to.price <= 0) return 0
  return from.price / to.price
}

/** Amount of `to` received for a given `from` amount. */
export function convert(amount: number, from: Token, to: Token): number {
  if (!Number.isFinite(amount)) return 0
  return amount * exchangeRate(from, to)
}
