import { useState, useEffect, useCallback } from 'react'
import { fetchTokenPrices } from '../services/prices'
import type { TokenWithPrice } from '../types'

export type PriceErrorKey = 'fetchPricesFailed'

interface UseTokenPricesReturn {
  tokens: TokenWithPrice[]
  loading: boolean
  errorKey: PriceErrorKey | null
  retry: () => void
}

export function useTokenPrices(): UseTokenPricesReturn {
  const [tokens, setTokens] = useState<TokenWithPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [errorKey, setErrorKey] = useState<PriceErrorKey | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    fetchTokenPrices()
      .then((list) => {
        if (!cancelled) {
          setTokens(list)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setErrorKey('fetchPricesFailed')
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [attempt])

  const retry = useCallback(() => {
    setLoading(true)
    setErrorKey(null)
    setAttempt((n) => n + 1)
  }, [])

  return { tokens, loading, errorKey, retry }
}
