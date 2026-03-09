/**
 * Wallet and balance types.
 * Reusable, strong typing — no `any` (per rules.md §9).
 */

import type { ReactNode } from 'react';

export type Blockchain =
  | 'Osmosis'
  | 'Ethereum'
  | 'Arbitrum'
  | 'Zilliqa'
  | 'Neo';

export interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain;
}

export interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

export interface BoxProps {
  className?: string;
  children?: ReactNode;
  [key: string]: unknown;
}

export type WalletPageProps = BoxProps;
