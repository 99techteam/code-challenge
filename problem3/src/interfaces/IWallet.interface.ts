export interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}
export interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
}
