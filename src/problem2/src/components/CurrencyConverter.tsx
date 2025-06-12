import React, { useState, useEffect } from 'react'
import CurrencyCard from './CurrencyCard'
import SwapButton from './SwapButton'
import ExchangeRateInfo from './ExchangeRateInfo'
import { fetchTokenPrices, calculateExchangeRate, getAvailableCurrencies, TokenPrice } from '../services/api'

interface Currency {
  code: string
  name: string
  icon: string
}

interface ValidationErrors {
  fromAmount?: string
  toAmount?: string
  general?: string
  api?: string
}

const currencyDisplayMap: Record<string, { name: string; icon: string }> = {
  BLUR: { name: 'Blur', icon: '/BLUR.svg' },
  bNEO: { name: 'bNEO', icon: '/bNEO.svg' },
  BUSD: { name: 'BUSD', icon: '/BUSD.svg' },
  USD: { name: 'USD', icon: '/USD.svg' },
  ETH: { name: 'Ethereum', icon: '/ETH.svg' },
  GMX: { name: 'GMX', icon: '/GMX.svg' },
  STEVMOS: { name: 'stEVMOS', icon: '/stEVMOS.svg' },
  LUNA: { name: 'Luna', icon: '/LUNA.svg' },
  RATOM: { name: 'rATOM', icon: '/rATOM.svg' },
  STRD: { name: 'Stride', icon: '/STRD.svg' },
  EVMOS: { name: 'Evmos', icon: '/EVMOS.svg' },
  IBCX: { name: 'IBCX', icon: '/IBCX.svg' },
  IRIS: { name: 'IRIS', icon: '/IRIS.svg' },
  ampLUNA: { name: 'ampLUNA', icon: '/ampLUNA.svg' },
  KUJI: { name: 'Kujira', icon: '/KUJI.svg' },
  STOSMO: { name: 'stOSMO', icon: '/stOSMO.svg' },
  USDC: { name: 'USDC', icon: '/USDC.svg' },
  axlUSDC: { name: 'axlUSDC', icon: '/axlUSDC.svg' },
  ATOM: { name: 'Cosmos', icon: '/ATOM.svg' },
  STATOM: { name: 'stATOM', icon: '/stATOM.svg' },
  OSMO: { name: 'Osmosis', icon: '/OSMO.svg' },
  rSWTH: { name: 'rSWTH', icon: '/rSWTH.svg' },
  STLUNA: { name: 'stLUNA', icon: '/stLUNA.svg' },
  LSI: { name: 'LSI', icon: '/LSI.svg' },
  OKB: { name: 'OKB', icon: '/OKB.svg' },
  OKT: { name: 'OKT', icon: '/OKT.svg' },
  SWTH: { name: 'Switcheo', icon: '/SWTH.svg' },
  USC: { name: 'USC', icon: '/USC.svg' },
  WBTC: { name: 'Wrapped BTC', icon: '/WBTC.svg' },
  wstETH: { name: 'wstETH', icon: '/wstETH.svg' },
  YieldUSD: { name: 'YieldUSD', icon: '/YieldUSD.svg' },
  ZIL: { name: 'Zilliqa', icon: '/ZIL.svg' }
}

const CurrencyConverter: React.FC = () => {
  const [fromCurrency, setFromCurrency] = useState<string>('USD')
  const [toCurrency, setToCurrency] = useState<string>('ETH')
  const [fromAmount, setFromAmount] = useState<string>('1')
  const [toAmount, setToAmount] = useState<string>('')
  const [rate, setRate] = useState<number>(1)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [tokenPrices, setTokenPrices] = useState<TokenPrice[]>([])
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const loadTokenPrices = async () => {
      setIsLoading(true)
      try {
        const prices = await fetchTokenPrices()
        setTokenPrices(prices)
        
        const availableCurrencies = getAvailableCurrencies(prices)
        const currencyList: Currency[] = availableCurrencies.map(code => ({
          code,
          name: currencyDisplayMap[code]?.name || code,
          icon: currencyDisplayMap[code]?.icon || '/USD.svg' // fallback to USD icon
        }))
        
        setCurrencies(currencyList)
        setErrors(prev => ({ ...prev, api: undefined }))
      } catch (error) {
        console.error('Failed to load token prices:', error)
        setErrors(prev => ({ 
          ...prev, 
          api: 'Failed to load token prices. Please try again.' 
        }))
      } finally {
        setIsLoading(false)
      }
    }
    
    loadTokenPrices()
  }, [])

  const validateAmount = (amount: string, fieldName: string): string | undefined => {
    if (!amount || amount.trim() === '') {
      return undefined
    }
    
    const numericAmount = parseFloat(amount)
    if (isNaN(numericAmount)) {
      return `${fieldName} must be a valid number`
    }
    
    if (numericAmount < 0) {
      return `${fieldName} cannot be negative`
    }
    
    if (numericAmount === 0) {
      return `${fieldName} must be greater than 0`
    }
    
    if (numericAmount > 999999999) {
      return `${fieldName} is too large (max: 999,999,999)`
    }
    
    const decimalPart = amount.split('.')[1]
    if (decimalPart && decimalPart.length > 8) {
      return `${fieldName} has too many decimal places (max: 8)`
    }
    
    return undefined
  }

  useEffect(() => {
    if (tokenPrices.length === 0) return
    
    if (fromCurrency === toCurrency) {
      setErrors(prev => ({ ...prev, general: 'Please select different currencies' }))
      return
    } else {
      setErrors(prev => ({ ...prev, general: undefined }))
    }

    try {
      const newRate = calculateExchangeRate(fromCurrency, toCurrency, tokenPrices)
      setRate(newRate)
      
      if (fromAmount !== '' && !isNaN(parseFloat(fromAmount))) {
        const numericAmount = parseFloat(fromAmount)
        const converted = (numericAmount * newRate).toFixed(8)
        setToAmount(converted)
      }
    } catch (error) {
      console.error('Error calculating exchange rate:', error)
      setErrors(prev => ({ 
        ...prev, 
        general: 'Unable to calculate exchange rate for selected currencies' 
      }))
    }
  }, [fromCurrency, toCurrency, tokenPrices, fromAmount])

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value)
    
    const error = validateAmount(value, 'From amount')
    setErrors(prev => ({ ...prev, fromAmount: error }))
    
    if (!error && value !== '' && !isNaN(parseFloat(value))) {
      const numericAmount = parseFloat(value)
      const converted = (numericAmount * rate).toFixed(8)
      setToAmount(converted)
      
      const toError = validateAmount(converted, 'To amount')
      setErrors(prev => ({ ...prev, toAmount: toError }))
    } else if (value === '') {
      setToAmount('')
      setErrors(prev => ({ ...prev, toAmount: undefined }))
    }
  }

  const handleToAmountChange = (value: string) => {
    setToAmount(value)
    
    const error = validateAmount(value, 'To amount')
    setErrors(prev => ({ ...prev, toAmount: error }))
    
    if (!error && value !== '' && !isNaN(parseFloat(value))) {
      const numericAmount = parseFloat(value)
      const converted = (numericAmount / rate).toFixed(8)
      setFromAmount(converted)
      
      const fromError = validateAmount(converted, 'From amount')
      setErrors(prev => ({ ...prev, fromAmount: fromError }))
    } else if (value === '') {
      setFromAmount('')
      setErrors(prev => ({ ...prev, fromAmount: undefined }))
    }
  }

  const handleCurrencySwap = () => {
    if (isLoading) return
    
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
    setFromAmount(toAmount)
    setToAmount(fromAmount)
    setErrors({})
  }

  const formatNumber = (num: string) => {
    const number = parseFloat(num) || 0
    return new Intl.NumberFormat().format(number)
  }

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const hasErrors = Object.values(errors).some(error => error !== undefined)

  if (isLoading) {
    return (
      <div className="w-full max-w-[600px] mx-auto flex flex-col justify-center items-center gap-8 p-4">
        <div className="p-2.5 flex justify-center items-center">
          <h1 className="text-center text-cyan-50 text-4xl font-bold font-inter uppercase tracking-wider text-shadow">
            Currency Converter
          </h1>
        </div>
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
          <p className="text-cyan-50 text-lg">Loading token prices...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[600px] mx-auto flex flex-col justify-center items-center gap-12 p-4">
      <div className="p-2.5 flex justify-center items-center">
        <h1 className="text-center text-cyan-50 text-4xl font-bold font-inter uppercase tracking-wider text-shadow">
          Currency Converter
        </h1>
      </div>

      {/* API Error Message */}
      {errors.api && (
        <div className="w-full p-4 bg-red-900/50 border border-red-500 rounded-lg flex items-center gap-3">
          <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <span className="text-red-300 font-medium">{errors.api}</span>
        </div>
      )}

      {/* General Error Message */}
      {errors.general && (
        <div className="w-full p-4 bg-red-900/50 border border-red-500 rounded-lg flex items-center gap-3">
          <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <span className="text-red-300 font-medium">{errors.general}</span>
        </div>
      )}

      {/* Currency Converter Container */}
      <div className="flex flex-col gap-8 relative w-full">
        <CurrencyCard
          currency={fromCurrency}
          amount={fromAmount}
          currencies={currencies}
          onCurrencyChange={setFromCurrency}
          onAmountChange={handleFromAmountChange}
          testIdPrefix="from"
          error={errors.fromAmount}
        />

        <CurrencyCard
          currency={toCurrency}
          amount={toAmount}
          currencies={currencies}
          onCurrencyChange={setToCurrency}
          onAmountChange={handleToAmountChange}
          testIdPrefix="to"
          error={errors.toAmount}
        />

        <SwapButton 
          onClick={handleCurrencySwap} 
          disabled={hasErrors || isLoading}
        />
      </div>

      {/* Exchange Rate Info */}
      {!hasErrors && fromAmount && toAmount && (
        <ExchangeRateInfo
          fromCurrency={fromCurrency}
          toCurrency={toCurrency}
          fromAmount={fromAmount}
          toAmount={toAmount}
          formatNumber={formatNumber}
          getCurrentTime={getCurrentTime}
        />
      )}
    </div>
  )
}

export default CurrencyConverter 