import { useState, useEffect, useCallback } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { motion, AnimatePresence } from 'framer-motion'
import classNames from 'classnames'
import { Token, SwapFormData } from 'src/types/token.type'
import useTokenPrices from 'src/hooks/useTokenPrices'
import TokenSelect from 'src/components/TokenSelect'
import { toast } from 'react-toastify'

// Validation schema
const swapSchema = yup.object().shape({
  fromToken: yup.string().required('Please select a token to swap from'),
  toToken: yup.string().required('Please select a token to swap to'),
  fromAmount: yup
    .string()
    .required('Amount is required')
    .test('is-positive', 'Amount must be greater than 0', (value) => {
      if (!value) return false
      const num = parseFloat(value)
      return !isNaN(num) && num > 0
    })
    .test('is-valid-number', 'Please enter a valid number', (value) => {
      if (!value) return false
      return !isNaN(parseFloat(value))
    }),
  toAmount: yup.string()
})

export default function SwapForm() {
  const { tokens, isLoading, isError, calculateToAmount, calculateFromAmount, getToken, refetch } = useTokenPrices()

  const [fromToken, setFromToken] = useState<Token | undefined>()
  const [toToken, setToToken] = useState<Token | undefined>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastEdited, setLastEdited] = useState<'from' | 'to'>('from')

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger
  } = useForm<SwapFormData>({
    resolver: yupResolver(swapSchema),
    defaultValues: {
      fromToken: '',
      toToken: '',
      fromAmount: '',
      toAmount: ''
    },
    mode: 'onChange'
  })

  const watchFromAmount = watch('fromAmount')
  const watchToAmount = watch('toAmount')

  // Auto-calculate toAmount when fromAmount changes
  useEffect(() => {
    if (lastEdited === 'from' && fromToken && toToken && watchFromAmount) {
      const fromAmt = parseFloat(watchFromAmount)
      if (!isNaN(fromAmt) && fromAmt > 0) {
        const result = calculateToAmount(fromToken.currency, toToken.currency, fromAmt)
        if (result !== null) {
          setValue('toAmount', result.toFixed(6))
        }
      } else {
        setValue('toAmount', '')
      }
    }
  }, [watchFromAmount, fromToken, toToken, calculateToAmount, setValue, lastEdited])

  // Auto-calculate fromAmount when toAmount changes
  useEffect(() => {
    if (lastEdited === 'to' && fromToken && toToken && watchToAmount) {
      const toAmt = parseFloat(watchToAmount)
      if (!isNaN(toAmt) && toAmt > 0) {
        const result = calculateFromAmount(fromToken.currency, toToken.currency, toAmt)
        if (result !== null) {
          setValue('fromAmount', result.toFixed(6))
        }
      } else {
        setValue('fromAmount', '')
      }
    }
  }, [watchToAmount, fromToken, toToken, calculateFromAmount, setValue, lastEdited])

  // Handle token selection
  const handleFromTokenSelect = useCallback(
    (token: Token) => {
      setFromToken(token)
      setValue('fromToken', token.currency)
      trigger('fromToken')
    },
    [setValue, trigger]
  )

  const handleToTokenSelect = useCallback(
    (token: Token) => {
      setToToken(token)
      setValue('toToken', token.currency)
      trigger('toToken')
    },
    [setValue, trigger]
  )

  // Swap tokens
  const handleSwapTokens = () => {
    const tempFromToken = fromToken
    const tempToToken = toToken
    const tempFromAmount = watchFromAmount
    const tempToAmount = watchToAmount

    setFromToken(tempToToken)
    setToToken(tempFromToken)
    setValue('fromToken', tempToToken?.currency || '')
    setValue('toToken', tempFromToken?.currency || '')
    setValue('fromAmount', tempToAmount)
    setValue('toAmount', tempFromAmount)
  }

  // Mock submit handler
  const onSubmit = async (data: SwapFormData) => {
    if (!fromToken || !toToken) return

    setIsSubmitting(true)

    // Simulate backend processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsSubmitting(false)

    toast.success(
      `Successfully swapped ${data.fromAmount} ${fromToken.currency} to ${data.toAmount} ${toToken.currency}`,
      {
        position: 'top-right',
        autoClose: 5000
      }
    )

    // Reset form after successful swap
    setValue('fromAmount', '')
    setValue('toAmount', '')
  }

  // Calculate exchange rate display
  const getExchangeRateDisplay = () => {
    if (!fromToken || !toToken) return null

    const rate = calculateToAmount(fromToken.currency, toToken.currency, 1)
    if (rate === null) return null

    return `1 ${fromToken.currency} = ${rate.toFixed(6)} ${toToken.currency}`
  }

  // Filter out selected token from the opposite select
  const availableFromTokens = tokens.filter((t) => t.currency !== toToken?.currency)
  const availableToTokens = tokens.filter((t) => t.currency !== fromToken?.currency)

  if (isLoading) {
    return (
      <div className='flex min-h-[400px] items-center justify-center'>
        <div className='text-center'>
          <div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600'></div>
          <p className='text-gray-600'>Loading token prices...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className='flex min-h-[400px] items-center justify-center'>
        <div className='text-center'>
          <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100'>
            <svg className='h-8 w-8 text-red-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
              />
            </svg>
          </div>
          <h3 className='mb-2 text-lg font-semibold text-gray-900'>Failed to load token prices</h3>
          <p className='mb-4 text-gray-600'>Please check your internet connection and try again.</p>
          <button
            onClick={() => refetch()}
            className='rounded-lg bg-indigo-600 px-6 py-2 font-medium text-white transition-colors hover:bg-indigo-700'
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='w-full max-w-md'>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
        {/* From Token Section */}
        <div className='rounded-2xl bg-gray-50 p-4'>
          <div className='mb-3 flex items-center justify-between'>
            <span className='text-sm font-medium text-gray-500'>From</span>
            {fromToken && (
              <span className='text-xs text-gray-400'>Price: ${fromToken.price.toLocaleString()}</span>
            )}
          </div>

          <div className='space-y-3'>
            <Controller
              name='fromToken'
              control={control}
              render={() => (
                <TokenSelect
                  tokens={availableFromTokens}
                  selectedToken={fromToken}
                  onSelect={handleFromTokenSelect}
                  placeholder='Select token'
                  error={errors.fromToken?.message}
                />
              )}
            />

            <Controller
              name='fromAmount'
              control={control}
              render={({ field }) => (
                <div>
                  <input
                    {...field}
                    type='text'
                    inputMode='decimal'
                    placeholder='0.00'
                    onChange={(e) => {
                      // Only allow valid number input
                      const value = e.target.value
                      if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
                        field.onChange(value)
                        setLastEdited('from')
                      }
                    }}
                    className={classNames(
                      'w-full rounded-xl border-2 bg-white px-4 py-3 text-xl font-semibold outline-none transition-all',
                      {
                        'border-red-400 focus:border-red-500': errors.fromAmount,
                        'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200': !errors.fromAmount
                      }
                    )}
                  />
                  {errors.fromAmount && <p className='mt-1 text-sm text-red-500'>{errors.fromAmount.message}</p>}
                </div>
              )}
            />
          </div>
        </div>

        {/* Swap Button */}
        <div className='flex justify-center'>
          <button
            type='button'
            onClick={handleSwapTokens}
            disabled={!fromToken || !toToken}
            className='group relative rounded-full bg-white p-3 shadow-md transition-all hover:shadow-lg disabled:opacity-50'
          >
            <svg
              className='h-5 w-5 text-indigo-600 transition-transform group-hover:rotate-180'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4' />
            </svg>
          </button>
        </div>

        {/* To Token Section */}
        <div className='rounded-2xl bg-gray-50 p-4'>
          <div className='mb-3 flex items-center justify-between'>
            <span className='text-sm font-medium text-gray-500'>To</span>
            {toToken && <span className='text-xs text-gray-400'>Price: ${toToken.price.toLocaleString()}</span>}
          </div>

          <div className='space-y-3'>
            <Controller
              name='toToken'
              control={control}
              render={() => (
                <TokenSelect
                  tokens={availableToTokens}
                  selectedToken={toToken}
                  onSelect={handleToTokenSelect}
                  placeholder='Select token'
                  error={errors.toToken?.message}
                />
              )}
            />

            <Controller
              name='toAmount'
              control={control}
              render={({ field }) => (
                <div>
                  <input
                    {...field}
                    type='text'
                    inputMode='decimal'
                    placeholder='0.00'
                    onChange={(e) => {
                      const value = e.target.value
                      if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
                        field.onChange(value)
                        setLastEdited('to')
                      }
                    }}
                    className='w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-xl font-semibold outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200'
                  />
                </div>
              )}
            />
          </div>
        </div>

        {/* Exchange Rate Display */}
        <AnimatePresence>
          {fromToken && toToken && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className='overflow-hidden'
            >
              <div className='rounded-xl bg-indigo-50 px-4 py-3'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-600'>Exchange Rate</span>
                  <span className='font-medium text-indigo-700'>{getExchangeRateDisplay()}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <button
          type='submit'
          disabled={isSubmitting || !fromToken || !toToken || !watchFromAmount}
          className={classNames(
            'relative w-full rounded-xl py-4 text-lg font-semibold text-white transition-all',
            {
              'cursor-not-allowed bg-gray-400': isSubmitting || !fromToken || !toToken || !watchFromAmount,
              'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg':
                !isSubmitting && fromToken && toToken && watchFromAmount
            }
          )}
        >
          <AnimatePresence mode='wait'>
            {isSubmitting ? (
              <motion.div
                key='loading'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className='flex items-center justify-center gap-3'
              >
                <svg className='h-5 w-5 animate-spin text-white' fill='none' viewBox='0 0 24 24'>
                  <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  />
                </svg>
                <span>Processing Swap...</span>
              </motion.div>
            ) : (
              <motion.span key='text' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {!fromToken || !toToken ? 'Select Tokens' : !watchFromAmount ? 'Enter Amount' : 'Swap Now'}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </form>

      {/* Info Section */}
      <div className='mt-6 rounded-xl border border-gray-200 bg-white p-4'>
        <h3 className='mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700'>
          <svg className='h-4 w-4 text-indigo-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
            />
          </svg>
          How it works
        </h3>
        <ul className='space-y-1 text-xs text-gray-500'>
          <li>• Select the tokens you want to swap</li>
          <li>• Enter the amount to swap</li>
          <li>• Review the exchange rate</li>
          <li>• Click "Swap Now" to complete</li>
        </ul>
      </div>
    </div>
  )
}
