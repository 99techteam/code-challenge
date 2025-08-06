export interface Token {
  currency: string;
  date: string;
  price: number;
}

export interface EnrichedToken extends Token {
  iconUrl: string;
  decimals: number;
}

export interface SwapFormData {
  fromToken: EnrichedToken | null;
  toToken: EnrichedToken | null;
  fromAmount: string;
  toAmount: string;
}

export interface SwapQuote {
  fromToken: EnrichedToken;
  toToken: EnrichedToken;
  fromAmount: string;
  toAmount: string;
  exchangeRate: number;
  priceImpact?: number;
}