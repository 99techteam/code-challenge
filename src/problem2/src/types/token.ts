export type PriceEntry = {
  currency: string
  date: string
  price: number
}

export type Token = {
  symbol: string
  price: number
  /** Most recent price-quote timestamp (ISO string) */
  updatedAt: string
  /** CDN URL for the token icon. */
  iconUrl: string
}
