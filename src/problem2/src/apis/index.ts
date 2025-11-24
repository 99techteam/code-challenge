import { CurrencyPrice, WalletData, UserData } from '../types/index.js'

export const fetchCurrencyPrices = async (): Promise<CurrencyPrice[]> => {
  const response = await fetch('https://interview.switcheo.com/prices.json')
  const result = await response.json()
  return result
}

export const fetchWalletData = async (): Promise<WalletData> => {
  const response = await fetch('/api/wallet.json')
  const result = await response.json()
  if (!result.success || !result.data) {
    throw new Error('Failed to fetch wallet data')
  }
  return result.data
}

export const fetchUserData = async (): Promise<UserData> => {
  const response = await fetch('/api/user.json')
  const result = await response.json()
  if (!result.success || !result.data) {
    throw new Error('Failed to fetch user data')
  }
  return result.data
}
