export interface TokenPrice {
  currency: string;
  date: string;
  price: number;
}

export interface PriceSnapshot {
  tokens: TokenPrice[];
  snapshotDate: string;
}

export type TokenSymbol = string;
export type SwapSide = 'pay' | 'receive';
export type DemoBalances = Record<TokenSymbol, number>;

export interface SwapSelection {
  pay: TokenSymbol;
  receive: TokenSymbol;
}

export interface SwapState {
  tokens: TokenPrice[];
  selected: SwapSelection;
  loading: boolean;
}

export interface SwapQuote {
  payAmount: number;
  receiveAmount: number;
  paySymbol: TokenSymbol;
  receiveSymbol: TokenSymbol;
}

export type SwapValidationResult =
  | { valid: true; quote: SwapQuote }
  | { valid: false; reason: 'empty' | 'invalid' | 'unavailable' | 'same-token' | 'balance'; message: string };
