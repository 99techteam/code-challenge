export interface PriceData {
  currency: string
  date: string
  price: number
}

export interface TokenPrices {
  [currency: string]: number
}

export interface Token {
  symbol: string
  price: number
}

export interface UseTokenPricesReturn {
  prices: TokenPrices
  tokens: Token[]
  loading: boolean
  error: string | null
}

