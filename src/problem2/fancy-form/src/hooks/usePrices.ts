import { useEffect, useState } from 'react'
import type { PriceEntry, Token } from '@/types/swap'

export function usePrices() {
  const [tokens, setTokens] = useState<Token[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('https://interview.switcheo.com/prices.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch prices')
        return res.json() as Promise<PriceEntry[]>
      })
      .then(raw => {
        const deduped = raw.reduce<Record<string, PriceEntry>>((acc, entry) => {
          if (!acc[entry.currency] || entry.date > acc[entry.currency].date)
            acc[entry.currency] = entry
          return acc
        }, {})

        const result: Token[] = Object.values(deduped)
          .map(entry => ({
            symbol: entry.currency,
            price: entry.price,
            iconUrl: `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${entry.currency}.svg`,
          }))
          .sort((a, b) => a.symbol.localeCompare(b.symbol))

        setTokens(result)
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Unknown error'))
      .finally(() => setLoading(false))
  }, [])

  return { tokens, loading, error }
}
