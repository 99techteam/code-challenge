export interface Token {
  symbol: string;
  name: string;
  price: number;
  decimals: number;
  iconUrl: string;
}

export interface SwapSettings {
  slippage: number; // e.g. 0.5 for 0.5%
  deadline: number; // minutes
  simulateFailure: boolean;
}

export interface WalletState {
  isConnected: boolean;
  address: string;
  balances: Record<string, number>;
}

export type TxStep = 'idle' | 'approving' | 'submitting' | 'confirming' | 'success' | 'error';

export interface TransactionReceipt {
  hash: string;
  fromSymbol: string;
  fromAmount: string;
  toSymbol: string;
  toAmount: string;
  rate: number;
  feeUsd: number;
  timestamp: number;
}

export interface SwapQuote {
  fromAmount: number;
  toAmount: number;
  rate: number;
  inverseRate: number;
  fromUsd: number;
  toUsd: number;
  priceImpact: number;
  minimumReceived: number;
  estimatedFeeUsd: number;
}

