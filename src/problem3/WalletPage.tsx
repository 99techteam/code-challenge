import React, { useMemo } from 'react';

// Type declarations for assumed external dependencies/hooks
export type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo' | string;

export interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain;
}

export interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
  usdValue: number;
}

export interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

// Assumed hooks and subcomponents
declare function useWalletBalances(): WalletBalance[];
declare function usePrices(): Record<string, number | undefined>;

interface WalletRowProps {
  className?: string;
  amount: number;
  usdValue: number;
  formattedAmount: string;
}

declare const WalletRow: React.FC<WalletRowProps>;

// 1. Hoist priority map outside the component to avoid re-creation on every render.
// Using a hash map provides O(1) lookup rather than re-evaluating switch-cases.
const BLOCKCHAIN_PRIORITY: Record<string, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20
};

const DEFAULT_PRIORITY = -99;

const getPriority = (blockchain: Blockchain): number => {
  return BLOCKCHAIN_PRIORITY[blockchain] ?? DEFAULT_PRIORITY;
};

export interface Props extends BoxProps {}

export const WalletPage: React.FC<Props> = ({ children, className, ...rest }) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  // 2. Optimized single-pass useMemo:
  // - Filters out invalid priorities and non-positive balances (balance.amount > 0).
  // - Sorts in descending priority with a deterministic comparator.
  // - Computes formatted string and USD value in one mapping step, eliminating dead code.
  // - Dependencies correctly include [balances, prices] since usdValue relies on prices.
  const formattedBalances = useMemo<FormattedWalletBalance[]>(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const priority = getPriority(balance.blockchain);
        return priority > DEFAULT_PRIORITY && balance.amount > 0;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        return getPriority(rhs.blockchain) - getPriority(lhs.blockchain);
      })
      .map((balance: WalletBalance) => {
        const price = prices[balance.currency] ?? 0;
        return {
          ...balance,
          formatted: balance.amount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 6
          }),
          usdValue: price * balance.amount
        };
      });
  }, [balances, prices]);

  return (
    <div className={className} {...rest}>
      {formattedBalances.map((balance: FormattedWalletBalance) => (
        <WalletRow
          // 3. Use stable unique compound key rather than array index
          key={`${balance.blockchain}-${balance.currency}`}
          amount={balance.amount}
          usdValue={balance.usdValue}
          formattedAmount={balance.formatted}
        />
      ))}
      {children}
    </div>
  );
};

export default WalletPage;

