export interface Token {
  name: string;
  symbol: string;
  price: number;
  blockchain: string;
}

export interface WalletBalance {
  token: Token;
  amount: number;
}

export interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
  usdValue: number;
}