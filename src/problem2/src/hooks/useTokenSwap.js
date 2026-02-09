import { useState, useEffect, useMemo, useCallback } from 'react'
import { fetchTokenPrices } from '../api/prices'
import { getExchangeRate, formatToAmount } from '../util/swap'
import {
  SUBMIT_DELAY_MS,
  PREFERRED_FROM_TOKEN,
  PREFERRED_TO_TOKEN,
} from '../constants'

export function useTokenSwap(options = {}) {
  const {
    submitDelayMs = SUBMIT_DELAY_MS,
    preferredFrom = PREFERRED_FROM_TOKEN,
    preferredTo = PREFERRED_TO_TOKEN,
  } = options

  const [tokens, setTokens] = useState([])
  const [loadingPrices, setLoadingPrices] = useState(true)
  const [priceError, setPriceError] = useState(null)

  const [fromToken, setFromToken] = useState('')
  const [toToken, setToToken] = useState('')
  const [fromAmount, setFromAmount] = useState('')
  const [fieldError, setFieldError] = useState({ from: null, to: null })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchTokenPrices()
      .then((list) => {
        if (!cancelled) {
          setTokens(list)
          if (list.length >= 2) {
            const from = list.find((t) => t.currency === preferredFrom) ?? list[0]
            const to = list.find((t) => t.currency === preferredTo) ?? list[1]
            setFromToken(from.currency)
            setToToken(to.currency)
          }
        }
      })
      .catch((err) => {
        if (!cancelled) setPriceError(err.message || 'Failed to load prices')
      })
      .finally(() => {
        if (!cancelled) setLoadingPrices(false)
      })
    return () => { cancelled = true }
  }, [preferredFrom, preferredTo])

  const exchangeRate = useMemo(
    () => (fromToken && toToken ? getExchangeRate(tokens, fromToken, toToken) : null),
    [tokens, fromToken, toToken]
  )

  const toAmount = useMemo(() => {
    if (!exchangeRate || fromAmount === '' || fromAmount === '.') return ''
    const num = parseFloat(fromAmount)
    if (Number.isNaN(num)) return ''
    return formatToAmount(num * exchangeRate)
  }, [fromAmount, exchangeRate])

  const setFromAmountWithReset = useCallback((value) => {
    setFromAmount(value)
    setFieldError((e) => ({ ...e, from: null }))
    setSubmitSuccess(false)
  }, [])

  const swapDirection = useCallback(() => {
    setFromToken(toToken)
    setToToken(fromToken)
    setFromAmount('')
    setFieldError({ from: null, to: null })
    setSubmitSuccess(false)
  }, [fromToken, toToken])

  const validate = useCallback(() => {
    const num = parseFloat(fromAmount)
    const fromErr =
      fromAmount === ''
        ? 'Enter an amount'
        : Number.isNaN(num)
          ? 'Enter a valid number'
          : num <= 0
            ? 'Amount must be greater than 0'
            : null
    const toErr = fromToken === toToken ? 'Choose two different tokens' : null
    setFieldError({ from: fromErr, to: toErr })
    return !fromErr && !toErr
  }, [fromAmount, fromToken, toToken])

  const submit = useCallback(
    (e) => {
      e?.preventDefault()
      if (!validate()) return
      setIsSubmitting(true)
      setSubmitSuccess(false)
      setTimeout(() => {
        setIsSubmitting(false)
        setSubmitSuccess(true)
      }, submitDelayMs)
    },
    [validate, submitDelayMs]
  )

  return {
    // Data
    tokens,
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    exchangeRate,

    // Loading & errors
    loadingPrices,
    priceError,
    fieldError,
    isSubmitting,
    submitSuccess,

    // Setters
    setFromToken,
    setToToken,
    setFromAmount: setFromAmountWithReset,

    // Actions
    swapDirection,
    validate,
    submit,
  }
}
