export interface CurrencyPrice {
  currency: string
  date: string
  price: number
}

export interface SwapFormData {
  inputAmount: number
  outputAmount: number
  inputCurrency: string
  outputCurrency: string
}

export interface InputNumberOptions {
  label: string
  placeholder?: string
  required?: boolean
  min?: number
  max?: number
  step?: number
  readonly?: boolean
  showMaxButton?: boolean
}

export interface UserData {
  userId: string
  username: string
  email: string
  firstName: string
  lastName: string
  avatar: string
  dateJoined: string
  lastLogin: string
  preferences: {
    currency: string
    theme: string
    notifications: {
      email: boolean
      push: boolean
      priceAlerts: boolean
    }
    language: string
  }
  verification: {
    email: boolean
    phone: boolean
    kyc: string
  }
  accountLevel: string
}

export interface WalletData {
  userId: string
  totalBalance: {
    usd: number
    btc: number
  }
  holdings: Array<{
    currency: string
    symbol: string
    name: string
    amount: number
    usdValue: number
    avgBuyPrice: number
    totalInvested: number
    profit: number
    profitPercent: number
    lastUpdated: string
  }>
  performance: {
    totalProfitLoss: number
    totalProfitLossPercent: number
    dayChange: {
      usd: number
      percent: number
    }
    weekChange: {
      usd: number
      percent: number
    }
    monthChange: {
      usd: number
      percent: number
    }
  }
  lastUpdated: string
}
