export interface TokenResponse {
  currency: string;
  date: string;
  price: number;
}

export interface Token extends TokenResponse {
  symbol?: string;
}

export interface TokenBalanceResponse {
  currency: string;
  amount: number;
}

export interface TokenBalance extends TokenBalanceResponse {
  symbol?: string;
}
