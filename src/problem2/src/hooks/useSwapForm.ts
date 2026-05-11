import { useCallback, useMemo, useState } from "react"

import { sanitizeAmountInput, validateAmount } from "@/lib/validation"
import type { Token } from "@/types/token"

type Pair = { from: string; to: string }

export type SwapStatus =
  | { kind: "idle" }
  | { kind: "submitting" }
  | {
      kind: "success"
      from: Token
      to: Token
      amountFrom: number
      amountTo: number
    }

type UseSwapFormParams = {
  tokens: Token[]
  defaultFrom: string
  defaultTo: string
}

type UseSwapFormResult = {
  // Pair / tokens
  fromToken: Token | null
  toToken: Token | null
  // Amount field
  amount: string
  parsedAmount: number
  toAmount: number
  setAmount: (next: string) => void
  // Derived metadata
  rate: number | null
  amountError: string | null
  pairError: string | null
  showAmountError: boolean
  touched: boolean
  canSubmit: boolean
  // Lifecycle
  status: SwapStatus
  swapPulse: boolean
  // Actions
  swapDirection: () => void
  selectFrom: (token: Token) => void
  selectTo: (token: Token) => void
  submit: () => void
  reset: () => void
}

/**
 * Encapsulates all state, derivation, and actions for the swap form so the
 * component stays presentational.
 */
export function useSwapForm({
  tokens,
  defaultFrom,
  defaultTo,
}: UseSwapFormParams): UseSwapFormResult {
  const [userPair, setUserPair] = useState<Pair | null>(null)
  const [amount, setAmountState] = useState("")
  const [touched, setTouched] = useState(false)
  const [status, setStatus] = useState<SwapStatus>({ kind: "idle" })
  const [swapPulse, setSwapPulse] = useState(false)

  const tokenMap = useMemo(
    () => new Map(tokens.map((t) => [t.symbol, t])),
    [tokens]
  )

  const defaultPair = useMemo<Pair | null>(() => {
    if (tokens.length === 0) return null
    const fallbackFrom =
      tokens.find((t) => t.symbol === defaultFrom) ?? tokens[0]
    const fallbackTo =
      tokens.find(
        (t) => t.symbol === defaultTo && t.symbol !== fallbackFrom.symbol
      ) ??
      tokens.find((t) => t.symbol !== fallbackFrom.symbol) ??
      tokens[0]
    return { from: fallbackFrom.symbol, to: fallbackTo.symbol }
  }, [tokens, defaultFrom, defaultTo])

  const pair = userPair ?? defaultPair
  const fromToken = pair ? tokenMap.get(pair.from) ?? null : null
  const toToken = pair ? tokenMap.get(pair.to) ?? null : null

  const { parsed: parsedAmount, error: amountError } = useMemo(
    () => validateAmount(amount),
    [amount]
  )

  const pairError =
    fromToken && toToken && fromToken.symbol === toToken.symbol
      ? "Pick two different tokens"
      : null

  const rate =
    fromToken && toToken && fromToken.symbol !== toToken.symbol
      ? fromToken.price / toToken.price
      : null

  const toAmount =
    rate && Number.isFinite(parsedAmount) && parsedAmount > 0
      ? parsedAmount * rate
      : 0

  const showAmountError = Boolean(touched && amountError)

  const canSubmit = Boolean(
    fromToken &&
      toToken &&
      !amountError &&
      !pairError &&
      status.kind !== "submitting"
  )

  const setAmount = useCallback((next: string) => {
    setAmountState((prev) => sanitizeAmountInput(next, prev))
    setTouched(true)
  }, [])

  const swapDirection = useCallback(() => {
    if (!pair) return
    setUserPair({ from: pair.to, to: pair.from })
    if (toAmount > 0) {
      setAmountState(stripTrailingZeros(toAmount.toFixed(8)))
    }
    setSwapPulse(true)
    window.setTimeout(() => setSwapPulse(false), 400)
  }, [pair, toAmount])

  const selectFrom = useCallback(
    (token: Token) => {
      if (!pair) return
      if (token.symbol === pair.to) {
        setUserPair({ from: token.symbol, to: pair.from })
      } else {
        setUserPair({ from: token.symbol, to: pair.to })
      }
    },
    [pair]
  )

  const selectTo = useCallback(
    (token: Token) => {
      if (!pair) return
      if (token.symbol === pair.from) {
        setUserPair({ from: pair.to, to: token.symbol })
      } else {
        setUserPair({ from: pair.from, to: token.symbol })
      }
    },
    [pair]
  )

  const submit = useCallback(() => {
    setTouched(true)
    if (!canSubmit || !fromToken || !toToken) return

    setStatus({ kind: "submitting" })
    window.setTimeout(() => {
      setStatus({
        kind: "success",
        from: fromToken,
        to: toToken,
        amountFrom: parsedAmount,
        amountTo: rate ? parsedAmount * rate : 0,
      })
    }, 1500)
  }, [canSubmit, fromToken, toToken, parsedAmount, rate])

  const reset = useCallback(() => {
    setStatus({ kind: "idle" })
    setAmountState("")
    setTouched(false)
  }, [])

  return {
    fromToken,
    toToken,
    amount,
    parsedAmount,
    toAmount,
    setAmount,
    rate,
    amountError,
    pairError,
    showAmountError,
    touched,
    canSubmit,
    status,
    swapPulse,
    swapDirection,
    selectFrom,
    selectTo,
    submit,
    reset,
  }
}

function stripTrailingZeros(s: string): string {
  if (!s.includes(".")) return s
  return s.replace(/\.?0+$/, "")
}
