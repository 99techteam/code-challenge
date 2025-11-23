import { useMemo } from 'react'
import { MAX_UI_DECIMALS } from '../utils/constants'
import { computeMinReceived, convertToken, limitDecimals } from '../utils/formatters/converter'
import type { Token } from '../utils/types'

type SwapCalcProps = {
  fromToken: Token | null
  toToken: Token | null
  amount: string | number
  slippage: number
}

type Out = {
  rate: number
  outputAmount: number
  minReceive: number
  usdFrom: number
  usdTo: number
  usdMinimum: number
  priceImpact: number
}

export const useSwapCalculator = ({
  fromToken,
  toToken,
  amount: fromAmount,
  slippage
}: SwapCalcProps) => {
  return useMemo(() => {
    const amt = Number(fromAmount)

    if (!fromToken || !toToken) {
      return {
        rate: 0,
        outputAmount: 0,
        minReceive: 0,
        usdFrom: 0,
        usdTo: 0,
        priceImpact: 0
      }
    }

    // 1. Compute actual output
    const converted = convertToken(amt, fromToken, toToken)
    const outputAmount = limitDecimals(converted, MAX_UI_DECIMALS)

    // 2. Minimum received (after slippage)
    const afterSlippage = computeMinReceived(outputAmount, slippage)
    const minReceive = limitDecimals(afterSlippage, MAX_UI_DECIMALS)

    // 3. Exchange rate (1 fromToken → ? toToken)
    const rate = fromToken.price / toToken.price

    // 4. USD values
    const usdFrom = amt * fromToken.price
    const usdTo = outputAmount * toToken.price
    const usdMinimum = minReceive * toToken.price

    // 5. Ideal output for price impact
    const idealOutput =
      fromToken.value === toToken.value ? amt : convertToken(amt, fromToken, toToken)

    // 6. Price impact (% difference from ideal output)
    const priceImpact = idealOutput > 0 ? ((idealOutput - outputAmount) / idealOutput) * 100 : 0

    return {
      rate,
      outputAmount,
      minReceive,
      usdFrom,
      usdTo,
      usdMinimum,
      priceImpact
    }
  }, [fromToken, toToken, fromAmount, slippage]) as Out
}
