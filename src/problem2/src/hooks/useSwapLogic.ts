import { useMemo } from 'react'
import { TokenPrice } from '@/hooks/usePrices'

export interface SwapState {
  fromToken: TokenPrice | null
  toToken: TokenPrice | null
  fromAmount: string
  toAmount: string
}

export const useSwapLogic = (
  fromToken: TokenPrice | null,
  toToken: TokenPrice | null,
  fromAmount: string
) => {
  const toAmount = useMemo(() => {
    if (
      !fromToken ||
      !toToken ||
      !fromAmount ||
      parseFloat(fromAmount) <= 0 ||
      toToken.price === 0
    ) {
      return '0'
    }

    const amount = parseFloat(fromAmount)
    const exchangeRate = fromToken.price / toToken.price
    const result = amount * exchangeRate

    // Format to 6 decimal places, removing trailing zeros
    return result.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    })
  }, [fromToken, toToken, fromAmount])

  const exchangeRate = useMemo(() => {
    if (!fromToken || !toToken) return 0
    return fromToken.price / toToken.price
  }, [fromToken, toToken])

  const isValid = useMemo(() => {
    const amount = parseFloat(fromAmount)
    return (
      fromToken &&
      toToken &&
      !isNaN(amount) &&
      amount > 0 &&
      fromToken.currency !== toToken.currency
    )
  }, [fromToken, toToken, fromAmount])

  return {
    toAmount,
    exchangeRate,
    isValid,
  }
}
