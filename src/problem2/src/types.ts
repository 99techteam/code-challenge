/** Shape of a single record returned by the Switcheo prices endpoint. */
export interface PriceRecord {
  currency: string;
  date: string;
  price: number;
}

/** A token as used by the UI — deduplicated, with the icon URL pre-computed. */
export interface Token {
  symbol: string;
  price: number;
  iconUrl: string;
}
