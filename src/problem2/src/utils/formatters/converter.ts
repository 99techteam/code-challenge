import type { Token } from '../types'

export const convertToDollar = (value: number): string => {
  if (Math.abs(value) < 0.0001) return '$0' // very tiny amounts → 0

  // decide decimals: small values get more decimals
  const decimals = value < 0.01 ? 6 : 2

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value)
}

// Token conversion using price ratio
export const convertToken = (amount: number, fromToken: Token, toToken: Token): number => {
  // If same token, just return the amount
  if (fromToken.symbol === toToken.symbol) return amount

  // Ensure rates exist
  if (!fromToken.price || !toToken.price) return 0

  const amountInBase = amount * fromToken.price
  return amountInBase / toToken.price
}

// Limit decimals for UI outputs (numbers only)
export const limitDecimals = (value: number, decimals: number): number => {
  if (isNaN(value)) return 0
  const factor = Math.pow(10, decimals)
  return Math.floor(value * factor) / factor
}

// Slippage: 1% → 0.01
export const computeMinReceived = (output: number, slippagePercent: number): number => {
  const slippage = slippagePercent / 100
  return output * (1 - slippage)
}
