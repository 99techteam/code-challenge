export interface Token {
  symbol: string;
  name: string;
  decimals: number;
  price?: number;
  icon: string;
}

export interface SwapState {
  fromToken: Token | null;
  toToken: Token | null;
  fromAmount: string;
  toAmount: string;
}

export interface Balance {
  [symbol: string]: number;
}

export interface SwapFormErrors {
  fromAmount?: string;
  fromBalance?: string;
  fromToken?: string;
  toToken?: string;
}
