/** A single price record as returned by the Switcheo prices endpoint. */
export interface PriceRecord {
  currency: string
  date: string
  price: number
}

/** A tradable token: a currency that has a known USD price. */
export interface Token {
  /** Ticker symbol, e.g. "ETH". */
  symbol: string
  /** USD price per unit. */
  price: number
  /** Remote SVG icon URL. */
  iconUrl: string
  /** Mocked wallet balance for this token. */
  balance: number
}
