export interface TokenPrice {
  currency: string;
  price: number;
  date: string;
}

export type PriceMap = Record<string, TokenPrice>;
