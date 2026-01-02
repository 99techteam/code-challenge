import { useState, useEffect, useMemo } from 'react'
import { PriceData, TokenPrices, Token, UseTokenPricesReturn } from '../models/token'

const PRICES_API_URL = import.meta.env.VITE_TOKEN_PRICES_API_URL;

export const useTokenPrices = (): UseTokenPricesReturn => {
  const [prices, setPrices] = useState<TokenPrices>({})
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setLoading(true)
        setError(null)

        if (!PRICES_API_URL || PRICES_API_URL === 'undefined') {
          throw new Error('API URL is not configured')
        }

        const response = await fetch(PRICES_API_URL)

        if (!response.ok) {
          throw new Error('Failed to fetch prices')
        }

        const data = await response.json() as PriceData[] | TokenPrices

        const pricesMap: TokenPrices = {}
        const currencyDates: { [key: string]: number } = {}

        if (Array.isArray(data)) {
          data.forEach((item: PriceData) => {
            if (item.currency && item.price != null) {
              const currency = item.currency
              const itemDate = item.date ? new Date(item.date).getTime() : 0
              const existingDate = currencyDates[currency] || 0

              if (!pricesMap[currency] || itemDate > existingDate) {
                pricesMap[currency] = item.price
                currencyDates[currency] = itemDate
              }
            }
          })
        } else {
          Object.assign(pricesMap, data)
        }

        setPrices(pricesMap)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        console.error('Error fetching token prices:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPrices()
  }, [])

  const tokens = useMemo<Token[]>(() => {
    return Object.keys(prices)
      .filter(token => prices[token] != null)
      .map(token => ({
        symbol: token,
        price: prices[token]
      }))
      .sort((a, b) => a.symbol.localeCompare(b.symbol))
  }, [prices])

  return { prices, tokens, loading, error }
}

