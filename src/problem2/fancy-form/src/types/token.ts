/** Raw token price entry from the Switcheo API */
export interface TokenPrice {
  currency: string;
  date: string;
  price: number;
}

/** Processed token ready for UI consumption */
export interface Token {
  currency: string;
  price: number;
  iconUrl: string;
  hasIcon: boolean;
}
