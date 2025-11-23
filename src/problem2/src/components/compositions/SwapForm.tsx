import { useState } from 'react'
import { getTokens } from '../../helpers'
import { useSwapCalculator } from '../../hooks/useSwapCalculator'
import { useTokens } from '../../hooks/useTokens'
import { MAX_UI_DECIMALS } from '../../utils/constants'
import { cn } from '../../utils/formatters/cn'
import { convertToDollar, limitDecimals } from '../../utils/formatters/converter'
import { TokenCardType } from '../../utils/types'
import { errorToast, notification, successToast } from '../shared/toast'
import ExchangeRate from './ExchangeRate'
import LoadingButton from './LoadingButton'
import { SwapSummary } from './SwapSummary'
import SwapToken from './SwapToken'
import TokenCard from './TokenCard'

const SLIPPAGE = 12 // 12% slippage

export default function SwapForm() {
  const tokens = getTokens()
  const { fromToken, setFromToken, toToken, setToToken, swapTokens } = useTokens(tokens)
  const [amount, setAmount] = useState('0')

  const calc = useSwapCalculator({ amount, fromToken, toToken, slippage: SLIPPAGE })

  const handleSubmit = async () => {
    try {
      const res = await fetch('/api/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromToken, toToken, amount, slippage: SLIPPAGE })
      })
      const data = await res.json()

      if (!res.ok) {
        errorToast(data.error)
        return
      }

      const receivedAmount = limitDecimals(data.toAmount, MAX_UI_DECIMALS)
      const usdTo = convertToDollar(data.usdTo)
      successToast(
        `Swap submitted: ${amount} ${fromToken.symbol} → ${receivedAmount} ${toToken.symbol} (${usdTo})`
      )
    } catch {
      notification(
        'Mock Service Worker (MSW) may have a cold start.',
        'This means the initial request might take slightly longer as the service worker registers and initializes. Subsequent requests will be served normally.'
      )
    }
  }

  return (
    <div
      className={cn(
        'w-full max-w-md rounded-2xl bg-linear-to-b from-white/4 to-white/2 p-6 text-white',
        'shadow-[0_8px_30px_rgba(2,6,23,0.6),inset_0_1px_0_rgba(255,255,255,0.02)]'
      )}
    >
      <h2 className='mb-4 text-lg font-semibold'>Swap</h2>
      <div className='relative'>
        <TokenCard
          type={TokenCardType.SELL}
          token={fromToken}
          onChangeToken={setFromToken}
          amount={amount}
          onChangeAmount={setAmount}
          tokens={tokens}
        />
        <SwapToken
          onClick={() => {
            setAmount('0')
            swapTokens()
          }}
        />
        <TokenCard
          type={TokenCardType.BUY}
          token={toToken}
          onChangeToken={setToToken}
          amount={String(calc.outputAmount)}
          tokens={tokens}
          disabled
        />
      </div>
      <ExchangeRate rate={calc.rate} fromToken={fromToken} toToken={toToken} className='mt-2' />
      <SwapSummary
        toToken={toToken}
        usdTo={calc.usdTo}
        outputAmount={calc.outputAmount}
        usdMinimum={calc.usdMinimum}
        minAmount={calc.minReceive}
        priceImpact={calc.priceImpact}
        slippage={SLIPPAGE}
      />

      <LoadingButton onClick={handleSubmit} className='mt-6 w-full'>
        Confirm Swap
      </LoadingButton>
    </div>
  )
}
