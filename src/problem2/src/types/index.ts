export interface Token {
  currency: string;
  date: string;
  price: number;
}

export interface TokenBalance {
  [currency: string]: number;
}

export interface SwapFormData {
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
}

export interface PriceData {
  [currency: string]: number;
}

export interface SwapTransaction {
  id: string;
  from: string;
  to: string;
  amountFrom: number;
  amountTo: number;
  timestamp: string;
  txHash?: string;
}
