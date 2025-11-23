import React, { useMemo } from 'react'
import { MAX_UI_DECIMALS } from '../../utils/constants'
import { convertToDollar, limitDecimals } from '../../utils/formatters/converter'
import type { Token } from '../../utils/types'

type SwapSummaryProps = {
  toToken: Token
  usdTo: number
  outputAmount: number
  usdMinimum: number
  minAmount: number
  priceImpact: number
  slippage: number
}

export const SwapSummary = ({
  toToken,
  usdTo,
  outputAmount,
  usdMinimum,
  minAmount,
  priceImpact,
  slippage
}: SwapSummaryProps) => {
  const format = (value: number) => limitDecimals(value, MAX_UI_DECIMALS)
  const convert = (value: number) => convertToDollar(value)

  const {
    formattedUsdTo,
    formattedOutputAmount,
    formattedUsdMinimum,
    formattedMinAmount,
    formattedPriceImpact
  } = useMemo(
    () => ({
      formattedUsdTo: convert(usdTo),
      formattedOutputAmount: format(outputAmount),
      formattedUsdMinimum: convert(usdMinimum),
      formattedMinAmount: format(minAmount),
      formattedPriceImpact: convert(priceImpact)
    }),
    [usdTo, outputAmount, usdMinimum, minAmount, priceImpact]
  )

  const isNegative = Number(priceImpact) < 0

  return (
    <div className='mt-3 space-y-2 rounded-xl border border-[rgba(255,255,255,0.02)] bg-white/2 p-3'>
      <Row label='Expected Output'>
        {formattedOutputAmount} {toToken.symbol} ({formattedUsdTo})
      </Row>

      <Row label='Minimum received'>
        {formattedMinAmount} {toToken.symbol} ({formattedUsdMinimum})
      </Row>

      <Row label='Price Impact'>
        <span className={isNegative ? 'text-red-400' : 'text-green-400'}>
          {formattedPriceImpact}%
        </span>
      </Row>

      <Row label='Slippage'>{slippage}%</Row>
    </div>
  )
}

type RowProps = { label: string; children: React.ReactNode }

const Row = React.memo(({ label, children }: RowProps) => (
  <div className='flex items-center justify-between gap-4 text-sm text-[#94a3b8]'>
    <span className='shrink-0 font-medium opacity-80'>{label}</span>
    <span className='text-right'>{children}</span>
  </div>
))
