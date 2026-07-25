import { useEffect, useMemo, useState } from 'react'
import type { Token } from '../types'
import { TokenField } from './TokenField'
import { TokenSelectModal } from './TokenSelectModal'
import { convert, exchangeRate } from '../utils/swap'
import { formatTokenAmount, formatUsd, parseAmount } from '../utils/format'

interface SwapFormProps {
  tokens: Token[]
  onSuccess: (summary: { fromAmount: number; from: string; toAmount: number; to: string }) => void
}

type ActiveSide = 'from' | 'to' | null

/** Pick a sensible default token by symbol, falling back to an index. */
function pick(tokens: Token[], symbol: string, fallbackIndex: number): Token {
  return tokens.find((t) => t.symbol === symbol) ?? tokens[fallbackIndex] ?? tokens[0]
}

/** The complete currency swap form: inputs, validation, and mocked submit. */
export function SwapForm({ tokens, onSuccess }: SwapFormProps) {
  const [fromToken, setFromToken] = useState<Token>(() => pick(tokens, 'ETH', 0))
  const [toToken, setToToken] = useState<Token>(() => pick(tokens, 'USDC', 1))
  const [amount, setAmount] = useState('')
  const [activeSide, setActiveSide] = useState<ActiveSide>(null)
  const [touched, setTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // If the token list identity changes (e.g. live data replaces fallback),
  // re-resolve the selected tokens so prices/balances stay in sync.
  useEffect(() => {
    setFromToken((prev) => pick(tokens, prev.symbol, 0))
    setToToken((prev) => pick(tokens, prev.symbol, 1))
  }, [tokens])

  const parsedAmount = parseAmount(amount)
  const rate = exchangeRate(fromToken, toToken)
  const receiveAmount = convert(parsedAmount, fromToken, toToken)

  const fromUsd = Number.isFinite(parsedAmount) ? parsedAmount * fromToken.price : NaN
  const toUsd = Number.isFinite(receiveAmount) ? receiveAmount * toToken.price : NaN

  const error = useMemo<string | null>(() => {
    if (amount.trim() === '') return 'Enter an amount to swap.'
    if (Number.isNaN(parsedAmount)) return 'Enter a valid number.'
    if (parsedAmount <= 0) return 'Amount must be greater than zero.'
    if (fromToken.symbol === toToken.symbol) return 'Choose two different tokens.'
    if (parsedAmount > fromToken.balance)
      return `Insufficient balance — you hold ${formatTokenAmount(fromToken.balance)} ${fromToken.symbol}.`
    return null
  }, [amount, parsedAmount, fromToken, toToken])

  const showError = touched && error

  function handleSwapDirection() {
    setFromToken(toToken)
    setToToken(fromToken)
    // Carry the computed receive amount over as the new pay amount for continuity.
    if (Number.isFinite(receiveAmount) && parsedAmount > 0) {
      setAmount(String(Number(receiveAmount.toFixed(8))))
    }
  }

  function handleSelect(token: Token) {
    if (activeSide === 'from') {
      // Prevent selecting the same token as the other side; swap instead.
      if (token.symbol === toToken.symbol) setToToken(fromToken)
      setFromToken(token)
    } else if (activeSide === 'to') {
      if (token.symbol === fromToken.symbol) setFromToken(toToken)
      setToToken(token)
    }
    setActiveSide(null)
  }

  function handleMax() {
    setTouched(true)
    setAmount(String(Number(fromToken.balance.toFixed(8))))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (error || submitting) return
    setSubmitting(true)
    // Mocked backend round-trip.
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setSubmitting(false)
    onSuccess({
      fromAmount: parsedAmount,
      from: fromToken.symbol,
      toAmount: receiveAmount,
      to: toToken.symbol,
    })
    setAmount('')
    setTouched(false)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/60 p-5 shadow-2xl backdrop-blur-xl sm:p-6"
    >
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">Swap</h1>
          <p className="text-xs text-slate-400">Trade tokens in an instant</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Live rates
        </span>
      </div>

      <div className="relative flex flex-col gap-1.5">
        <TokenField
          label="You pay"
          token={fromToken}
          value={amount}
          usdValue={fromUsd}
          onValueChange={(v) => {
            setTouched(true)
            setAmount(v)
          }}
          onOpenSelect={() => setActiveSide('from')}
          onMax={handleMax}
          error={showError ? error : undefined}
        />

        {/* Swap-direction button, overlapping the two fields */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 justify-center">
          <button
            type="button"
            onClick={handleSwapDirection}
            aria-label="Swap direction"
            className="pointer-events-auto group flex h-10 w-10 items-center justify-center rounded-xl border-4 border-slate-900 bg-indigo-500 text-white shadow-lg transition hover:bg-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 active:scale-95"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="transition-transform duration-300 group-hover:rotate-180"
            >
              <path d="M7 4v13M7 17l-3-3m3 3 3-3M17 20V7m0 13 3-3m-3 3-3-3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <TokenField
          label="You receive"
          token={toToken}
          value={
            parsedAmount > 0 && Number.isFinite(receiveAmount)
              ? formatTokenAmount(receiveAmount)
              : ''
          }
          readOnly
          usdValue={toUsd}
          onOpenSelect={() => setActiveSide('to')}
        />
      </div>

      {/* Exchange-rate line */}
      <div className="mt-4 flex items-center justify-between rounded-xl bg-white/[0.03] px-3.5 py-2.5 text-xs">
        <span className="text-slate-400">Rate</span>
        <span className="font-medium text-slate-200">
          1 {fromToken.symbol} = {formatTokenAmount(rate)} {toToken.symbol}
        </span>
      </div>

      {/* Inline validation message */}
      <div className="mt-3 min-h-[1.25rem]">
        {showError && (
          <p className="animate-fade-in flex items-center gap-1.5 text-xs font-medium text-rose-400">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v4m0 4h.01" strokeLinecap="round" />
            </svg>
            {error}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={!!error || submitting}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-3.5 text-sm font-bold text-white shadow-lg transition
          hover:from-indigo-400 hover:to-violet-400
          disabled:cursor-not-allowed disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-400 disabled:shadow-none
          focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 active:scale-[0.99]"
      >
        {submitting ? (
          <>
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.4 0 0 5.4 0 12h4z" />
            </svg>
            Confirming swap…
          </>
        ) : amount.trim() === '' ? (
          'Enter an amount'
        ) : error ? (
          error
        ) : (
          'CONFIRM SWAP'
        )}
      </button>

      {parsedAmount > 0 && !error && (
        <p className="mt-3 text-center text-[11px] text-slate-500">
          You will receive ≈ {formatTokenAmount(receiveAmount)} {toToken.symbol} ({formatUsd(toUsd)})
        </p>
      )}

      <TokenSelectModal
        open={activeSide !== null}
        tokens={tokens}
        selectedSymbol={activeSide === 'from' ? fromToken.symbol : toToken.symbol}
        disabledSymbol={activeSide === 'from' ? toToken.symbol : fromToken.symbol}
        onSelect={handleSelect}
        onClose={() => setActiveSide(null)}
      />
    </form>
  )
}
