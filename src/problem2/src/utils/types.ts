export type Price = {
  currency: string
  date: string
  price: number
}

export type Token = {
  symbol: string
  value: string
  icon: string
  price: number
}

export enum TokenCardType {
  SELL = 'SELL',
  BUY = 'BUY'
}
