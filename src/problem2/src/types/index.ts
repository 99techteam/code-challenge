export interface PriceEntry {
  currency: string;
  date: string;
  price: number;
}

export interface Token {
  currency: string;
  price: number;
  iconUrl: string;
}

export interface SwapFormValues {
  fromAmount: string;
  toAmount: string;
  fromToken: Token | null;
  toToken: Token | null;
}

export type ModalTarget = 'from' | 'to';

export type ValidationField = 'fromToken' | 'toToken' | 'fromAmount' | 'general';

export interface ValidationError {
  field: ValidationField;
  message: string;
}

export interface Transaction {
  id: string;
  fromToken: string;
  toToken: string;
  fromAmount: number;
  toAmount: number;
  rate: number;
  timestamp: Date;
  status: 'completed' | 'pending';
}
