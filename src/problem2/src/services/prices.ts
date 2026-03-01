import type { PriceEntry, TokenWithPrice } from '../types'
import { PRICES_URL } from '../configs'

export async function fetchTokenPrices(): Promise<TokenWithPrice[]> {
  const res = await fetch(PRICES_URL)
  if (!res.ok) throw new Error('Failed to fetch prices')
  const data: PriceEntry[] = await res.json()
  const byCurrency = new Map<string, { date: string; price: number }>()
  for (const entry of data) {
    const existing = byCurrency.get(entry.currency)
    if (
      !existing ||
      new Date(entry.date).getTime() > new Date(existing.date).getTime()
    ) {
      byCurrency.set(entry.currency, { date: entry.date, price: entry.price })
    }
  }
  return Array.from(byCurrency.entries())
    .map(([currency, { price }]) => ({ currency, price }))
    .sort((a, b) => a.currency.localeCompare(b.currency))
}

export function convertAmount(
  amount: number,
  fromPrice: number,
  toPrice: number
): number {
  if (fromPrice <= 0 || toPrice <= 0) return 0
  const usdValue = amount * fromPrice
  return usdValue / toPrice
}
