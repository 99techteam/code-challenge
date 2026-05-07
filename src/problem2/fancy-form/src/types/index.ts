export interface TokenPrice {
  currency: string;
  date: string;
  price: number;
}

export interface Token {
  symbol: string;
  price: number;
  iconUrl: string;
  balance?: number;
}

export type SwapStatus = 'idle' | 'loading' | 'success' | 'error';
