import { useState, useMemo, useCallback } from 'react'
import { convertAmount } from '../services/prices'
import type { TokenWithPrice } from '../types'
import { DEFAULT_SLIPPAGE } from '../constants'

export type AmountErrorKey = 'invalidNumber' | 'positiveRequired'

type SwapStatus = 'idle' | 'confirming' | 'swapping' | 'success' | 'error'

export function useSwap(tokens: TokenWithPrice[]) {
  const [fromCurrency, _setFromCurrency] = useState('')
  const [toCurrency, _setToCurrency] = useState('')
  const [fromAmount, _setFromAmount] = useState('')
  const [slippage, setSlippage] = useState(DEFAULT_SLIPPAGE)
  const [status, setStatus] = useState<SwapStatus>('idle')
  const [statusMessage, setStatusMessage] = useState('')

  if (tokens.length >= 2 && !fromCurrency) {
    _setFromCurrency(tokens[0].currency)
  }
  if (tokens.length >= 2 && !toCurrency) {
    const second = tokens.find((t) => t.currency !== tokens[0].currency)
    if (second) _setToCurrency(second.currency)
  }

  const dismissStatus = useCallback(() => {
    if (status === 'success' || status === 'error') {
      setStatus('idle')
      setStatusMessage('')
    }
  }, [status])

  const setFromCurrency = useCallback(
    (c: string) => {
      _setFromCurrency(c)
      dismissStatus()
    },
    [dismissStatus],
  )

  const setToCurrency = useCallback(
    (c: string) => {
      _setToCurrency(c)
      dismissStatus()
    },
    [dismissStatus],
  )

  const setFromAmount = useCallback(
    (a: string) => {
      _setFromAmount(a)
      dismissStatus()
    },
    [dismissStatus],
  )

  const fromToken = useMemo(
    () => tokens.find((t) => t.currency === fromCurrency),
    [tokens, fromCurrency],
  )
  const toToken = useMemo(
    () => tokens.find((t) => t.currency === toCurrency),
    [tokens, toCurrency],
  )

  const amountNum = fromAmount === '' ? NaN : Number(fromAmount)
  const validAmount = !Number.isNaN(amountNum) && amountNum > 0

  const estimatedAmount = useMemo(() => {
    if (!validAmount || !fromToken || !toToken) return null
    return convertAmount(amountNum, fromToken.price, toToken.price)
  }, [validAmount, amountNum, fromToken, toToken])

  const exchangeRate = useMemo(() => {
    if (!fromToken || !toToken || fromToken.price <= 0 || toToken.price <= 0)
      return null
    return fromToken.price / toToken.price
  }, [fromToken, toToken])

  const priceImpact = useMemo(() => {
    if (!validAmount) return 0
    return Math.min(0.5, amountNum * 0.001)
  }, [validAmount, amountNum])

  const minimumReceived = useMemo(() => {
    if (estimatedAmount == null) return null
    return estimatedAmount * (1 - slippage / 100)
  }, [estimatedAmount, slippage])

  const sameToken = fromCurrency === toCurrency && fromCurrency !== ''

  const amountErrorKey = useMemo((): AmountErrorKey | null => {
    if (fromAmount === '') return null
    if (Number.isNaN(amountNum)) return 'invalidNumber'
    if (amountNum <= 0) return 'positiveRequired'
    return null
  }, [fromAmount, amountNum])

  const canSubmit =
    validAmount &&
    !!fromCurrency &&
    !!toCurrency &&
    !sameToken &&
    status !== 'swapping'

  const swapDirection = useCallback(() => {
    const prevFrom = fromCurrency
    const prevTo = toCurrency
    const prevEst = estimatedAmount
    _setFromCurrency(prevTo)
    _setToCurrency(prevFrom)
    if (prevEst != null) _setFromAmount(prevEst.toFixed(6))
    dismissStatus()
  }, [fromCurrency, toCurrency, estimatedAmount, dismissStatus])

  const requestSwap = useCallback(() => {
    if (!canSubmit) return
    setStatus('confirming')
  }, [canSubmit])

  const confirmSwap = useCallback(async () => {
    setStatus('swapping')
    setStatusMessage('')
    await new Promise((r) => setTimeout(r, 2000))
    setStatus('success')
  }, [])

  const cancelSwap = useCallback(() => {
    if (status === 'swapping') return
    setStatus('idle')
    setStatusMessage('')
  }, [status])

  return {
    fromCurrency,
    toCurrency,
    fromAmount,
    slippage,
    status,
    statusMessage,
    fromToken,
    toToken,
    estimatedAmount,
    exchangeRate,
    priceImpact,
    minimumReceived,
    sameToken,
    canSubmit,
    amountErrorKey,
    setFromCurrency,
    setToCurrency,
    setFromAmount,
    setSlippage,
    swapDirection,
    requestSwap,
    confirmSwap,
    cancelSwap,
  }
}
