export interface TokenPrice {
  currency: string
  date: string
  price: number
}

export interface Token {
  currency: string
  price: number
  iconUrl: string
}

export interface SwapFormData {
  fromToken: string
  toToken: string
  fromAmount: string
  toAmount: string
}

export interface SwapResult {
  fromToken: Token
  toToken: Token
  fromAmount: number
  toAmount: number
  exchangeRate: number
  timestamp: Date
}
