import { useState, useEffect, useCallback } from 'react'

const useCurrencySwap = () => {
  const [prices, setPrices] = useState({})
  const [tokens, setTokens] = useState([])
  const [selectedFromToken, setSelectedFromToken] = useState('ETH')
  const [selectedToToken, setSelectedToToken] = useState('USDC')
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')
  const [exchangeRate, setExchangeRate] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Load prices from API
  const loadPrices = useCallback(async () => {
    try {
      const response = await fetch('https://interview.switcheo.com/prices.json')
      const priceData = await response.json()
      
      const processedPrices = {}
      priceData.forEach(item => {
        if (!processedPrices[item.currency] || new Date(item.date) > new Date(processedPrices[item.currency].date)) {
          processedPrices[item.currency] = {
            price: item.price,
            date: item.date
          }
        }
      })
      
      setPrices(processedPrices)
    } catch (error) {
      console.error('Failed to load prices:', error)
      setError('Failed to load price data. Please refresh the page.')
    }
  }, [])

  // Setup available tokens
  const setupTokens = useCallback(() => {
    const availableTokens = [
      { symbol: 'ETH', name: 'Ethereum', icon: 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/ETH.svg' },
      { symbol: 'USDC', name: 'USD Coin', icon: 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/USDC.svg' },
      { symbol: 'USDT', name: 'Tether USD', icon: 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/USDT.svg' },
      { symbol: 'WBTC', name: 'Wrapped Bitcoin', icon: 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/WBTC.svg' },
      { symbol: 'ATOM', name: 'Cosmos', icon: 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/ATOM.svg' },
      { symbol: 'OSMO', name: 'Osmosis', icon: 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/OSMO.svg' },
      { symbol: 'LUNA', name: 'Terra Luna', icon: 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/LUNA.svg' },
      { symbol: 'SWTH', name: 'Switcheo Token', icon: 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/SWTH.svg' },
      { symbol: 'BUSD', name: 'Binance USD', icon: 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/BUSD.svg' },
      { symbol: 'KUJI', name: 'Kujira', icon: 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/KUJI.svg' },
      { symbol: 'ZIL', name: 'Zilliqa', icon: 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/ZIL.svg' },
      { symbol: 'OKB', name: 'OKB', icon: 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/OKB.svg' }
    ].filter(token => prices[token.symbol]) // Only include tokens with price data

    setTokens(availableTokens)
  }, [prices])

  // Calculate exchange rate
  const calculateExchangeRate = useCallback(() => {
    const fromPrice = prices[selectedFromToken]?.price
    const toPrice = prices[selectedToToken]?.price
    
    if (fromPrice && toPrice) {
      const rate = fromPrice / toPrice
      setExchangeRate(rate)
    }
  }, [prices, selectedFromToken, selectedToToken])

  // Calculate to amount from from amount
  const calculateToAmount = useCallback((amount) => {
    if (!amount || !prices[selectedFromToken] || !prices[selectedToToken]) {
      setToAmount('')
      return
    }

    const fromPrice = prices[selectedFromToken].price
    const toPrice = prices[selectedToToken].price
    
    const usdValue = parseFloat(amount) * fromPrice
    const calculatedAmount = usdValue / toPrice
    
    setToAmount(calculatedAmount.toFixed(6))
  }, [prices, selectedFromToken, selectedToToken])

  // Calculate from amount from to amount
  const calculateFromAmount = useCallback((amount) => {
    if (!amount || !prices[selectedFromToken] || !prices[selectedToToken]) {
      setFromAmount('')
      return
    }

    const fromPrice = prices[selectedFromToken].price
    const toPrice = prices[selectedToToken].price
    
    const usdValue = parseFloat(amount) * toPrice
    const calculatedAmount = usdValue / fromPrice
    
    setFromAmount(calculatedAmount.toFixed(6))
  }, [prices, selectedFromToken, selectedToToken])

  // Handle from amount change
  const handleFromAmountChange = useCallback((value) => {
    setFromAmount(value)
    calculateToAmount(value)
  }, [calculateToAmount])

  // Handle to amount change
  const handleToAmountChange = useCallback((value) => {
    setToAmount(value)
    calculateFromAmount(value)
  }, [calculateFromAmount])

  // Swap tokens
  const swapTokens = useCallback(() => {
    const temp = selectedFromToken
    setSelectedFromToken(selectedToToken)
    setSelectedToToken(temp)

    // Swap amounts
    const tempAmount = fromAmount
    setFromAmount(toAmount)
    setToAmount(tempAmount)
  }, [selectedFromToken, selectedToToken, fromAmount, toAmount])

  // Clear amounts
  const clearAmounts = useCallback(() => {
    setFromAmount('')
    setToAmount('')
  }, [])

  // Simulate swap operation
  const simulateSwap = useCallback(async (fromAmount, toAmount) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() < 0.05) {
          reject(new Error('Simulated network error'))
        } else {
          resolve({ fromAmount, toAmount })
        }
      }, 2000)
    })
  }, [])

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (isLoading) return

    const fromAmountNum = parseFloat(fromAmount)
    const toAmountNum = parseFloat(toAmount)

    // Validation
    if (!fromAmountNum || fromAmountNum <= 0) {
      setError('Please enter a valid amount to send')
      return
    }

    if (!toAmountNum || toAmountNum <= 0) {
      setError('Please enter a valid amount to receive')
      return
    }

    if (selectedFromToken === selectedToToken) {
      setError('Cannot swap the same token')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      await simulateSwap(fromAmountNum, toAmountNum)
      setSuccess(`Successfully swapped ${fromAmountNum} ${selectedFromToken} for ${toAmountNum.toFixed(6)} ${selectedToToken}`)
      clearAmounts()
    } catch (error) {
      setError('Swap failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, fromAmount, toAmount, selectedFromToken, selectedToToken, simulateSwap, clearAmounts])

  // Show error
  const showError = useCallback((message) => {
    setError(message)
  }, [])

  // Show success
  const showSuccess = useCallback((message) => {
    setSuccess(message)
  }, [])

  // Initialize
  useEffect(() => {
    loadPrices()
  }, [loadPrices])

  useEffect(() => {
    if (Object.keys(prices).length > 0) {
      setupTokens()
    }
  }, [prices, setupTokens])

  useEffect(() => {
    calculateExchangeRate()
  }, [calculateExchangeRate])

  // Clear messages after a delay
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [success])

  return {
    prices,
    tokens,
    selectedFromToken,
    selectedToToken,
    fromAmount,
    toAmount,
    exchangeRate,
    isLoading,
    error,
    success,
    setSelectedFromToken,
    setSelectedToToken,
    setFromAmount: handleFromAmountChange,
    setToAmount: handleToAmountChange,
    swapTokens,
    handleSubmit,
    clearAmounts,
    showError,
    showSuccess
  }
}

export { useCurrencySwap }
