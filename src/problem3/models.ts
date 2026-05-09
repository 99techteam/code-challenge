import type { ComponentPropsWithoutRef } from 'react';

export type Blockchain =
  | 'Osmosis'
  | 'Ethereum'
  | 'Arbitrum'
  | 'Zilliqa'
  | 'Neo'
  | (string & {});

export interface WalletBalance {
  blockchain: Blockchain;
  currency: string;
  amount: number;
}

export interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

/** Row-ready data: formatted amount + derived USD for one balance. */
export interface WalletRowViewModel extends FormattedWalletBalance {
  usdValue: number;
}

export type BoxProps = ComponentPropsWithoutRef<'div'>;
