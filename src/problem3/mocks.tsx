// Stand-ins for symbols the original code pulled from external modules:
// `useWalletBalances`, `usePrices`, `WalletRow`, `BoxProps`, `classes`.
// They let the refactored component actually render inside the demo tab.

import type React from 'react';

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
  usdValue: number;
}

export type BoxProps = React.HTMLAttributes<HTMLDivElement>;

export const classes = {
  row: 'p3-row',
} as const;

// --- demo data (mock hook outputs) ---

const FIXTURE_BALANCES: WalletBalance[] = [
  { currency: 'ETH', amount: 2.4137, blockchain: 'Ethereum' },
  { currency: 'OSMO', amount: 1280.5, blockchain: 'Osmosis' },
  { currency: 'ARB', amount: 530.0, blockchain: 'Arbitrum' },
  { currency: 'ZIL', amount: 12_500, blockchain: 'Zilliqa' },
  { currency: 'NEO', amount: 42.18, blockchain: 'Neo' },
  // amount <= 0 → should be filtered out
  { currency: 'GAS', amount: 0, blockchain: 'Neo' },
  // priority -99 → should be filtered out
  { currency: 'UNKNOWN', amount: 10, blockchain: 'Osmosis' },
];

const FIXTURE_PRICES: Record<string, number> = {
  ETH: 2_385.0,
  OSMO: 0.78,
  ARB: 0.91,
  ZIL: 0.018,
  NEO: 11.4,
  GAS: 4.2,
  // UNKNOWN intentionally has no price
};

// React Hooks rules require a stable identity so React treats them as
// hooks; using regular functions is fine because they have no state.
export const useWalletBalances = (): WalletBalance[] => FIXTURE_BALANCES;
export const usePrices = (): Record<string, number> => FIXTURE_PRICES;

interface WalletRowProps {
  className?: string;
  amount: number;
  usdValue: number;
  formattedAmount: string;
  currency: string;
  blockchain: Blockchain;
}

export function WalletRow({
  className,
  amount,
  usdValue,
  formattedAmount,
  currency,
  blockchain,
}: WalletRowProps) {
  return (
    <div className={className}>
      <div className="p3-row-main">
        <span className="p3-row-symbol">{currency}</span>
        <span className="p3-row-chain">{blockchain}</span>
      </div>
      <div className="p3-row-numbers">
        <span className="p3-row-amount mono">
          {formattedAmount}{' '}
          <span className="p3-row-amount-raw">({amount})</span>
        </span>
        <span className="p3-row-usd mono">
          $
          {usdValue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      </div>
    </div>
  );
}
