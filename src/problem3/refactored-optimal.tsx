/**
 * OPTIMAL VERSION - WalletPage Component
 * 
 * Further optimizations beyond the basic refactor:
 * - Prices properly integrated into memoization
 * - No redundant usdValue recalculation
 * - Better separation of concerns
 * - More defensive programming
 */

import React, { useMemo } from 'react';

type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo';

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
  usdValue: number;
}

interface Props extends BoxProps {}

// Extracted as constant for potential reuse and testing
const BLOCKCHAIN_PRIORITIES: Record<string, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
} as const;

const DEFAULT_PRIORITY = -99;

const getPriority = (blockchain: string): number => {
  return BLOCKCHAIN_PRIORITIES[blockchain] ?? DEFAULT_PRIORITY;
};

// Comparator function for sorting
const sortByPriorityDesc = (lhs: WalletBalance, rhs: WalletBalance): number => {
  return getPriority(rhs.blockchain) - getPriority(lhs.blockchain);
};

const WalletPage: React.FC<Props> = (props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  // ✅ Now includes prices in dependencies since we compute usdValue
  // ✅ Single-pass transformation: filter -> sort -> format
  // ✅ All data needed for rendering is computed here
  const formattedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        // Keep only balances with valid priority and positive amount
        return getPriority(balance.blockchain) > DEFAULT_PRIORITY && balance.amount > 0;
      })
      .sort(sortByPriorityDesc)
      .map((balance: WalletBalance): FormattedWalletBalance => {
        // Format with 2 decimal places for currency display
        const formatted = balance.amount.toFixed(2);
        // Compute USD value, default to 0 if price not available
        const usdValue = (prices[balance.currency] ?? 0) * balance.amount;
        
        return {
          ...balance,
          formatted,
          usdValue,
        };
      });
  }, [balances, prices]); // ✅ Both dependencies are now actually used

  // ✅ Simple mapping - all data pre-computed
  // ✅ Unique key based on currency
  // ✅ Could use crypto address or composite key if currency isn't unique
  return (
    <div {...rest}>
      {formattedBalances.map((balance: FormattedWalletBalance) => (
        <WalletRow
          key={balance.currency}
          amount={balance.amount}
          usdValue={balance.usdValue}
          formattedAmount={balance.formatted}
        />
      ))}
    </div>
  );
};

export default WalletPage;

