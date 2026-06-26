/** A single price record as returned by the Switcheo prices endpoint. */
export interface PriceRecord {
  currency: string;
  date: string;
  price: number;
}

/** A token usable in the swap form: a currency that has a known USD price. */
export interface Token {
  /** Ticker symbol, e.g. "ETH". */
  symbol: string;
  /** USD price per unit. */
  price: number;
  /** URL of the token's SVG icon. */
  icon: string;
}
