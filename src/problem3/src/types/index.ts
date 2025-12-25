/**
 * Type definitions for the Wallet application
 */

import type { ReactNode } from 'react';

export type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo';

export interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain;
}

export interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

export interface Prices {
  [currency: string]: number;
}

export interface BoxProps {
  className?: string;
  children?: ReactNode;
  [key: string]: unknown;
}

