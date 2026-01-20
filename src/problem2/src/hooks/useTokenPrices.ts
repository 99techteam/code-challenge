import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import tokenApi from 'src/apis/token.api'
import { Token, TokenPrice } from 'src/types/token.type'

export function useTokenPrices() {
  const {
    data: rawPrices,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<TokenPrice[]>({
    queryKey: ['tokenPrices'],
    queryFn: tokenApi.getTokenPrices,
  })

  // Process prices: group by currency and get latest price, filter out zero prices
  const tokens = useMemo<Token[]>(() => {
    if (!rawPrices) return []

    // Group by currency and get the latest price (most recent date)
    const currencyMap = new Map<string, TokenPrice>()

    rawPrices.forEach((item) => {
      const existing = currencyMap.get(item.currency)
      if (!existing || new Date(item.date) > new Date(existing.date)) {
        currencyMap.set(item.currency, item)
      }
    })

    // Convert to Token array and filter out tokens with no price or zero price
    return Array.from(currencyMap.values())
      .filter((item) => item.price && item.price > 0)
      .map((item) => ({
        currency: item.currency,
        price: item.price,
        iconUrl: tokenApi.getTokenIconUrl(item.currency)
      }))
      .sort((a, b) => a.currency.localeCompare(b.currency))
  }, [rawPrices])

  // Helper to get token by currency
  const getToken = (currency: string): Token | undefined => {
    return tokens.find((t) => t.currency === currency)
  }

  // Calculate exchange rate from token A to token B
  const calculateExchangeRate = (fromCurrency: string, toCurrency: string): number | null => {
    const fromToken = getToken(fromCurrency)
    const toToken = getToken(toCurrency)

    if (!fromToken || !toToken || fromToken.price === 0) {
      return null
    }

    return fromToken.price / toToken.price
  }

  // Calculate amount received
  const calculateToAmount = (fromCurrency: string, toCurrency: string, fromAmount: number): number | null => {
    const rate = calculateExchangeRate(fromCurrency, toCurrency)
    if (rate === null || isNaN(fromAmount) || fromAmount <= 0) {
      return null
    }
    return fromAmount * rate
  }

  // Calculate amount needed (reverse calculation)
  const calculateFromAmount = (fromCurrency: string, toCurrency: string, toAmount: number): number | null => {
    const rate = calculateExchangeRate(fromCurrency, toCurrency)
    if (rate === null || isNaN(toAmount) || toAmount <= 0) {
      return null
    }
    return toAmount / rate
  }

  return {
    tokens,
    isLoading,
    isError,
    error,
    refetch,
    getToken,
    calculateExchangeRate,
    calculateToAmount,
    calculateFromAmount
  }
}

export default useTokenPrices
