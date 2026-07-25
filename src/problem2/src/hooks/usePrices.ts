import { useEffect, useState } from 'react'
import type { Token } from '../types'
import { buildTokens } from '../utils/swap'
import { FALLBACK_PRICES } from '../data/fallbackPrices'

const PRICES_URL = 'https://interview.switcheo.com/prices.json'

interface PricesState {
  tokens: Token[]
  loading: boolean
  /** Non-fatal note shown when the app fell back to bundled data. */
  usingFallback: boolean
}

/**
 * Loads token prices from the Switcheo endpoint and derives the tradable token
 * list. Never throws: on any failure it falls back to a bundled snapshot so the
 * form always renders.
 */
export function usePrices(): PricesState {
  const [state, setState] = useState<PricesState>({
    tokens: [],
    loading: true,
    usingFallback: false,
  })

  useEffect(() => {
    let cancelled = false

    async function load() {
      // Small artificial delay so the loading skeleton is perceptible.
      const settle = (tokens: Token[], usingFallback: boolean) => {
        if (!cancelled) setState({ tokens, loading: false, usingFallback })
      }

      try {
        const res = await fetch(PRICES_URL, { cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        const tokens = buildTokens(data)
        if (tokens.length === 0) throw new Error('No priced tokens')
        settle(tokens, false)
      } catch {
        settle(buildTokens(FALLBACK_PRICES), true)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return state
}
