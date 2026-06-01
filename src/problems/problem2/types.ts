export type TokenPrice = {
  currency: string
  date: string
  price: number
}

export type TokenInfo = {
  symbol: string
  price: number
  imageUrl: string
}

export type SwapFormValues = {
  fromToken: string
  fromAmount: string
  toToken: string
}

export type SwapRecord = {
  id: string
  fromSymbol: string
  fromAmount: number
  toSymbol: string
  toAmount: number
  rate: number
  timestamp: Date
}
