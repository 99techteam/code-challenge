/** Which half of the converter a value or interaction belongs to. */
export type SwapSide = 'from' | 'to';

/**
 * A currency the converter can quote, derived from the price feed. One per
 * ticker: the feed repeats some currencies, so only the newest quote survives.
 */
export interface Token {
  /** Ticker exactly as the feed spells it. This is the identity used everywhere. */
  code: string;
  /** Display name for the asset menu. Falls back to `code` when unknown. */
  name: string;
  /** Price in USD. Always finite and greater than zero. */
  price: number;
  /** How many fraction digits an amount of this token is shown with. */
  decimals: number;
  /** Switcheo token-icon URL for this ticker. */
  iconUrl: string;
}

/** What the price feed is doing right now. */
export type PricesStatus = 'loading' | 'ready' | 'error';
