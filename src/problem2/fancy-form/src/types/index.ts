export interface DefaultToken {
  currency: string;
  date: string;
  price: number;
}

export interface Token {
  symbol: string;
  name: string;
  icon: string;
  price: number;
  balance?: number;
}

export interface SwapState {
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: string;
  slippage: number;
  isLoading: boolean;
  priceImpact: number;
}

export interface SwapQuote {
  fromAmount: string;
  toAmount: string;
}

export type SwapStatus =
  | "idle"
  | "loading"
  | "confirming"
  | "success"
  | "error";

export interface TokenSelectProps {
  value: Token;
  onChange: (token: Token) => void;
  excludeSymbol?: string;
}

export interface AmountInputProps {
  label: string;
  direction: "from" | "to";
  amount: string;
  token: Token;
  onAmountChange?: (value: string) => void;
  onTokenChange: (token: Token) => void;
  readonly?: boolean;
  excludeSymbol?: string;
}
