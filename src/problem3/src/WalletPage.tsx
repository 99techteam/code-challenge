import React, { useMemo } from 'react';
import { useWalletBalances } from './hooks/useWalletBalances';
import { usePrices } from './hooks/usePrices';
import { WalletRow } from './components/WalletRow';
import { Blockchain, WalletBalance, FormattedWalletBalance, BoxProps } from './types/wallet';

// ==========================================
// Constants & Pure Helpers (Outside Component)
// ==========================================
const BLOCKCHAIN_PRIORITY: Record<string, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20
};

const DEFAULT_PRIORITY = -99;

// O(1) hash map lookup
export const getPriority = (blockchain: Blockchain): number => {
  return BLOCKCHAIN_PRIORITY[blockchain] ?? DEFAULT_PRIORITY;
};

export interface Props extends BoxProps {}

export const WalletPage: React.FC<Props> = ({ children, className = '', ...rest }) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  // Unified single-pass memoization:
  // - Filter: only valid priority (> -99) and positive balance (> 0)
  // - Sort: descending priority using stable numeric difference (rhs - lhs)
  // - Map: computes 'formatted' and 'usdValue' once, handling missing price fallbacks (?? 0)
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
    <div className={`space-y-2.5 ${className}`} {...rest}>
      {formattedBalances.map((balance: FormattedWalletBalance) => (
        <WalletRow
          // Stable composite key
          key={`${balance.blockchain}-${balance.currency}`}
          amount={balance.amount}
          usdValue={balance.usdValue}
          formattedAmount={balance.formatted}
          currency={balance.currency}
          blockchain={balance.blockchain}
        />
      ))}
      {children}
    </div>
  );
};

export default WalletPage;

