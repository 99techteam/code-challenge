/**
 * Problem 3: Messy React Code - Refactored Version
 * All issues from the original code have been fixed.
 */

import React, { useMemo } from 'react';

// ===== TYPES & INTERFACES =====

type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo';

interface WalletBalance {
  blockchain: Blockchain;
  currency: string;
  amount: number;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
  usdValue: number;
}

interface HTMLDivAttributes {
  className?: string;
  children?: any;
  [key: string]: any;
}

interface Props extends HTMLDivAttributes {}

interface PriceMap {
  [currency: string]: number;
}

// ===== CONSTANTS =====

const BLOCKCHAIN_PRIORITY: Record<Blockchain, number> = {
  'Osmosis': 100,
  'Ethereum': 50,
  'Arbitrum': 30,
  'Zilliqa': 20,
  'Neo': 20,
};

// ===== HELPER FUNCTIONS =====

const getPriority = (blockchain: Blockchain): number => {
  return BLOCKCHAIN_PRIORITY[blockchain] ?? -99;
};

// ===== MOCK HOOKS =====

function useWalletBalances(): WalletBalance[] {
  return [];
}

function usePrices(): PriceMap {
  return {};
}

// ===== MAIN COMPONENT =====

function WalletPage(props: Props): React.ReactNode {
  const { ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  // Filter and sort balances
  const getSortedBalances = (balances: WalletBalance[]): WalletBalance[] => {
    return balances
      .filter((balance: WalletBalance) => {
        const priority = getPriority(balance.blockchain);
        return priority > -99 && balance.amount > 0;
      })
      .sort((a: WalletBalance, b: WalletBalance) => {
        const aPriority = getPriority(a.blockchain);
        const bPriority = getPriority(b.blockchain);
        return bPriority - aPriority;
      });
  };

  const sortedBalances = useMemo(() => getSortedBalances(balances), [balances]);

  // Format balances and calculate USD values
  const getFormattedBalances = (
    sortedBalances: WalletBalance[],
    prices: PriceMap
  ): FormattedWalletBalance[] => {
    return sortedBalances.map((balance: WalletBalance): FormattedWalletBalance => {
      const usdValue = (prices[balance.currency] ?? 0) * balance.amount;
      return {
        ...balance,
        formatted: balance.amount.toFixed(2),
        usdValue,
      };
    });
  };

  const formattedBalances = useMemo(
    () => getFormattedBalances(sortedBalances, prices),
    [sortedBalances, prices]
  );

  const rows = formattedBalances.map((balance: FormattedWalletBalance) => (
    <WalletRow
      key={balance.currency}
      amount={balance.amount}
      usdValue={balance.usdValue}
      formattedAmount={balance.formatted}
    />
  ));

  return <div {...rest}>{rows}</div>;
}

// ===== WALLETROW COMPONENT =====

interface WalletRowProps {
  amount: number;
  usdValue: number;
  formattedAmount: string;
  className?: string;
}

const WalletRow: React.FC<WalletRowProps> = ({
  usdValue,
  formattedAmount,
  className,
}) => {
  return (
    <div className={className}>
      <span>{formattedAmount}</span> - <span>${usdValue.toFixed(2)}</span>
    </div>
  );
};

// ===== EXPORTS =====

export default WalletPage;
export type { WalletBalance, FormattedWalletBalance, Props };
