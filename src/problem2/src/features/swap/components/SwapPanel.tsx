import { useMemo, useState } from "react"
import { CheckCircleIcon, ShieldCheckIcon } from "@phosphor-icons/react"

import { useSwapForm } from "@/features/swap/hooks/useSwapForm"
import {
  calculateExchangeRate,
  calculateNotionalValue,
  parseSwapAmount,
} from "@/features/swap/services/quoteCalculator"
import {
  formatCurrency,
  formatTokenAmount,
} from "@/shared/lib/formatters"
import { QuoteStrip } from "./QuoteStrip"
import { SwapForm } from "./SwapForm"
import { SwapSubmitButton } from "./SwapSubmitButton"
import { SwapSummary } from "./SwapSummary"

export function SwapPanel() {
  const {
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    setFromToken,
    setToToken,
    setFromAmount,
    switchTokens,
  } = useSwapForm()

  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  const parsedAmount = parseSwapAmount(fromAmount)
  const canSwap = !!fromToken && !!toToken && parsedAmount > 0 && !loading

  const exchangeRateLabel = useMemo(() => {
    const exchangeRate = calculateExchangeRate(fromToken, toToken)

    if (!fromToken || !toToken || !exchangeRate) {
      return "Choose two tokens to preview the quote"
    }

    return `1 ${fromToken.currency} = ${formatTokenAmount(exchangeRate)} ${toToken.currency}`
  }, [fromToken, toToken])

  const notionalValue = useMemo(
    () => formatCurrency(calculateNotionalValue(fromAmount, fromToken)),
    [fromAmount, fromToken],
  )

  const resetSuccess = () => setSuccessMessage("")

  const handleSwap = () => {
    if (!canSwap || !fromToken || !toToken) {
      return
    }

    resetSuccess()
    setLoading(true)

    window.setTimeout(() => {
      setLoading(false)
      setSuccessMessage(
        `Submitted ${formatTokenAmount(parsedAmount)} ${fromToken.currency} for ${toAmount} ${toToken.currency}.`,
      )
    }, 900)
  }

  return (
    <section className="swap-panel" aria-labelledby="swap-title">
      <div className="swap-panel__header">
        <div>
          <p className="swap-panel__kicker">Instant quote</p>
          <h2 id="swap-title">Currency Swap</h2>
        </div>
        <div className="swap-panel__badge">
          <ShieldCheckIcon aria-hidden size={16} weight="fill" />
          No custody
        </div>
      </div>

      <QuoteStrip label={exchangeRateLabel} />

      <SwapForm
        fromToken={fromToken}
        toToken={toToken}
        fromAmount={fromAmount}
        toAmount={toAmount}
        onFromTokenChange={(token) => {
          resetSuccess()
          setFromToken(token)
        }}
        onToTokenChange={(token) => {
          resetSuccess()
          setToToken(token)
        }}
        onFromAmountChange={(amount) => {
          resetSuccess()
          setFromAmount(amount)
        }}
        onSwitchTokens={() => {
          resetSuccess()
          switchTokens()
        }}
      />

      <SwapSummary estimatedValue={notionalValue} />

      {successMessage && (
        <p className="success-message" role="status">
          <CheckCircleIcon aria-hidden size={18} weight="fill" />
          {successMessage}
        </p>
      )}

      <SwapSubmitButton
        canSubmit={canSwap}
        isLoading={loading}
        onSubmit={handleSwap}
      />
    </section>
  )
}
