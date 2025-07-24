import { Token } from '@/constants'
import type { Balances } from '@/types'

// Helper to generate random amount
function randomAmount(min = 0.01, max = 1000, decimals = 4): number {
  const num = Math.random() * (max - min) + min
  return parseFloat(num.toFixed(decimals))
}

// Generate balances as an object: { [currency: string]: number }
export function generateRandomBalanceMap(maxAmount = 500): Balances {
  const currencies = Object.values(Token)
  const balanceMap: Balances = {}

  currencies.forEach((currency) => {
    balanceMap[currency] = randomAmount(0.01, maxAmount).toString()
  })

  return balanceMap
}
