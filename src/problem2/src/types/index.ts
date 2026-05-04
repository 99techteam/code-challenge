export interface Token {
  symbol: string;
  name: string;
  icon: string;
  balance: number;
  price: number;
}

export type SwapSide = 'from' | 'to';
export type OrderType = 'market' | 'limit';
