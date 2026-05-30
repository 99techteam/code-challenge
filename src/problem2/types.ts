// Domain types for the currency swap form.

export interface PriceEntry {
  currency: string;
  date: string;
  price: number;
}

export interface Token {
  symbol: string;
  price: number;
  balance: number;
  iconUrl: string;
}

export interface SwapQuote {
  amountIn: number;
  amountOut: number;
  rate: number;
  feePct: number;
  feeAmount: number;
  minReceived: number;
}
