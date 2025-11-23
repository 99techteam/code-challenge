import { useMemo } from 'react'
import { useFetchSuspense } from '../hooks/useFetchSuspense'
import { getLatestUniqueTokens } from '../utils/formatters/date-and-time'
import type { Price } from '../utils/types'

export const getTokens = () => {
  const prices = useFetchSuspense<Price[]>('https://interview.switcheo.com/prices.json')
  const tokenList = useFetchSuspense<Record<string, string>>('/tokenList.json')

  const uniquePrices = useMemo(() => getLatestUniqueTokens(prices), [prices])

  return useMemo(
    () =>
      Object.entries(tokenList)
        .map(([symbol, icon]) => ({
          symbol,
          value: symbol,
          icon,
          price: uniquePrices.find(p => p.currency === symbol)?.price ?? 0
        }))
        .filter(t => !!t.price),
    [tokenList, uniquePrices]
  )
}
