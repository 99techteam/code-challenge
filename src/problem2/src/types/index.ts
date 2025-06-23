export interface Token {
  currency: string;
  date: string;
  price: number;
}

export interface SwapFormData {
  fromCurrency: string;
  toCurrency: string;
  amount: number | null;
}

export interface TokenOption {
  value: string;
  label: string;
  icon: string;
}
