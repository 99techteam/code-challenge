export interface PriceEntry {
  currency: string
  date: string
  price: number
}

export interface Token {
  symbol: string
  price: number
  iconUrl: string
}

export interface SwapErrors {
  fromAmount?: string
  fromToken?: string
  toToken?: string
  sameToken?: string
}
