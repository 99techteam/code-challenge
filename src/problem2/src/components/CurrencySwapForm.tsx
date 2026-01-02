import { useState, useCallback, useMemo } from 'react'
import TokenSelector from './TokenSelector'
import AmountInput from './AmountInput'
import SwapButton from './SwapButton'
import ErrorMessage from './ErrorMessage'
import { ArrowUpDown } from 'lucide-react'
import { CurrencySwapFormProps, FormErrors } from '../models/component'

const CurrencySwapForm = ({ prices, pricesLoading }: CurrencySwapFormProps) => {
  const [fromToken, setFromToken] = useState<string>('')
  const [toToken, setToToken] = useState<string>('')
  const [fromAmount, setFromAmount] = useState<string>('')
  const [toAmount, setToAmount] = useState<string>('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const availableTokens = useMemo<string[]>(() => {
    return Object.keys(prices).filter(token => prices[token] != null && prices[token] > 0)
  }, [prices])

  const exchangeRate = useMemo<number | null>(() => {
    if (!fromToken || !toToken || !prices[fromToken] || !prices[toToken]) {
      return null
    }
    const fromPrice = parseFloat(String(prices[fromToken]))
    const toPrice = parseFloat(String(prices[toToken]))

    if (isNaN(fromPrice) || isNaN(toPrice) || fromPrice <= 0 || toPrice <= 0) {
      return null
    }

    return fromPrice / toPrice
  }, [fromToken, toToken, prices])

  const calculateToAmount = useCallback((amount: string): string => {
    if (!amount || !exchangeRate || isNaN(exchangeRate)) {
      return ''
    }
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      return ''
    }
    const result = (numAmount * exchangeRate).toFixed(6)
    return parseFloat(result).toString()
  }, [exchangeRate])

  const handleFromAmountChange = useCallback((value: string) => {
    setFromAmount(value)
    const calculated = calculateToAmount(value)
    setToAmount(calculated)

    if (errors.fromAmount) {
      setErrors(prev => ({ ...prev, fromAmount: '' }))
    }
  }, [calculateToAmount, errors.fromAmount])

  const handleToAmountChange = useCallback((value: string) => {
    setToAmount(value)
    if (!value || !exchangeRate || isNaN(exchangeRate)) {
      setFromAmount('')
      return
    }
    const numAmount = parseFloat(value)
    if (isNaN(numAmount) || numAmount <= 0) {
      setFromAmount('')
      return
    }
    const reverseRate = 1 / exchangeRate
    const result = (numAmount * reverseRate).toFixed(6)
    setFromAmount(parseFloat(result).toString())

    if (errors.toAmount) {
      setErrors(prev => ({ ...prev, toAmount: '' }))
    }
  }, [exchangeRate, errors.toAmount])

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {}

    if (!fromToken) {
      newErrors.fromToken = 'Please select a token to send'
    }

    if (!toToken) {
      newErrors.toToken = 'Please select a token to receive'
    }

    if (fromToken === toToken) {
      newErrors.toToken = 'Cannot swap the same token'
    }

    if (!fromAmount || parseFloat(fromAmount) <= 0 || isNaN(parseFloat(fromAmount))) {
      newErrors.fromAmount = 'Please enter a valid amount'
    }

    if (!toAmount || parseFloat(toAmount) <= 0 || isNaN(parseFloat(toAmount))) {
      newErrors.toAmount = 'Please enter a valid amount'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [fromToken, toToken, fromAmount, toAmount])


  const handleSwap = useCallback(() => {
    if (!fromToken || !toToken) return

    const tempToken = fromToken
    const tempAmount = fromAmount

    setFromToken(toToken)
    setToToken(tempToken)
    setFromAmount(toAmount)
    setToAmount(tempAmount)
    setErrors({})
  }, [fromToken, toToken, fromAmount, toAmount])

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    await new Promise(resolve => setTimeout(resolve, 2000))

    setIsSubmitting(false)

    alert(`Successfully swapped ${fromAmount} ${fromToken} for ${toAmount} ${toToken}`)

    setFromAmount('')
    setToAmount('')
  }, [validateForm, fromAmount, fromToken, toAmount, toToken])

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-600">Amount to send</label>
        <div className="flex gap-3 flex-col sm:flex-row">
          <TokenSelector
            tokens={availableTokens}
            selectedToken={fromToken}
            onTokenChange={setFromToken}
            error={errors.fromToken}
            disabled={pricesLoading}
          />
          <AmountInput
            value={fromAmount}
            onChange={handleFromAmountChange}
            error={errors.fromAmount}
            disabled={pricesLoading || !fromToken}
            placeholder="0.00"
          />
        </div>
        <ErrorMessage message={errors.fromToken} />
        <ErrorMessage message={errors.fromAmount} />
      </div>

      <button
        type="button"
        className="self-center w-12 h-12 rounded-full border-2 border-slate-200 bg-white text-slate-500 cursor-pointer flex items-center justify-center transition-all hover:border-blue-500 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed -my-2 z-10"
        onClick={handleSwap}
        disabled={!fromToken || !toToken || pricesLoading}
        aria-label="Swap tokens"
      >
        <ArrowUpDown size={24} />
      </button>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-600">Amount to receive</label>
        <div className="flex gap-3 flex-col sm:flex-row">
          <TokenSelector
            tokens={availableTokens}
            selectedToken={toToken}
            onTokenChange={setToToken}
            error={errors.toToken}
            disabled={pricesLoading}
          />
          <AmountInput
            value={toAmount}
            onChange={handleToAmountChange}
            error={errors.toAmount}
            disabled={pricesLoading || !toToken}
            placeholder="0.00"
          />
        </div>
        <ErrorMessage message={errors.toToken} />
        <ErrorMessage message={errors.toAmount} />
      </div>

      {exchangeRate && fromToken && toToken && !isNaN(exchangeRate) && isFinite(exchangeRate) && (
        <div className="text-center text-sm text-slate-500 py-3 px-4 bg-slate-50 rounded-lg">
          <span>1 {fromToken} = {exchangeRate.toFixed(6)} {toToken}</span>
        </div>
      )}

      <SwapButton
        isSubmitting={isSubmitting}
        disabled={pricesLoading || !fromToken || !toToken || !fromAmount || !toAmount}
      />
    </form>
  )
}

export default CurrencySwapForm
