import React, { useMemo } from 'react';

// 1. Improved Interfaces
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string; // Added missing property
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

// Define specific priorities as a constant for maintainability
const PRIORITY_MAP: Record<string, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

const getPriority = (blockchain: string): number => PRIORITY_MAP[blockchain] ?? -99;

const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  // 2. Optimized Memoization
  const formattedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const priority = getPriority(balance.blockchain);
        return priority > -99 && balance.amount > 0;
      })
      .sort((lhs, rhs) => getPriority(rhs.blockchain) - getPriority(lhs.blockchain))
      .map((balance: WalletBalance) => ({
        ...balance,
        formatted: balance.amount.toLocaleString(), // Using locale for better formatting
      }));
  }, [balances]); // Removed 'prices' dependency

  // 3. Clean Rendering Logic
  const rows = formattedBalances.map((balance: FormattedWalletBalance) => {
    const usdValue = (prices[balance.currency] ?? 0) * balance.amount;
    return (
      <WalletRow 
        className={classes.row}
        key={`${balance.blockchain}-${balance.currency}`} // Unique key
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.formatted}
      />
    );
  });

  return <div {...rest}>{rows}</div>;
};