export type Blockchain =
  | "Osmosis"
  | "Ethereum"
  | "Arbitrum"
  | "Zilliqa"
  | "Neo"
  | string;

export interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain;
}

export interface EnrichedWalletBalance extends WalletBalance {
  formatted: string;
  usdValue: number;
}

export interface WalletRowProps {
  className: string;
  amount: number;
  usdValue: number;
  formattedAmount: string;
}

export interface SimpleBoxProps {
  id?: string;
  style?: React.CSSProperties;
  classes: { row: string };
}
