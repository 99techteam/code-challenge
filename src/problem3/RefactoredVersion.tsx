import React, { useMemo, useCallback } from 'react';

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string; // Added missing property
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

// Use BoxProps directly instead of empty extension
const WalletPage: React.FC<BoxProps> = ({ children, ...rest }) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  // Move outside component or memoize to avoid recreation
  const getPriority = useCallback((blockchain: string): number => {
    switch (blockchain) {
      case 'Osmosis':
        return 100;
      case 'Ethereum':
        return 50;
      case 'Arbitrum':
        return 30;
      case 'Zilliqa':
      case 'Neo':
        return 20;
      default:
        return -99;
    }
  }, []);

  // Fixed logic and combined operations for efficiency
  const sortedFormattedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const priority = getPriority(balance.blockchain);
        // Keep balances with valid priority AND positive amounts
        return priority > -99 && balance.amount > 0;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        
        // Complete comparison with fallback
        if (leftPriority !== rightPriority) {
          return rightPriority - leftPriority; // Descending order
        }
        // Fallback: sort by currency name for stability
        return lhs.currency.localeCompare(rhs.currency);
      })
      .map((balance: WalletBalance): FormattedWalletBalance => ({
        ...balance,
        formatted: balance.amount.toFixed(2) // Added decimal places for currency
      }));
  }, [balances, getPriority]); // Removed unused 'prices' dependency

  // Memoize rows to prevent unnecessary re-renders
  const rows = useMemo(() => {
    return sortedFormattedBalances.map((balance: FormattedWalletBalance) => {
      const usdValue = prices[balance.currency] * balance.amount;
      return (
        <WalletRow 
          className={classes.row}
          key={`${balance.blockchain}-${balance.currency}`} // Stable unique key
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={balance.formatted}
        />
      );
    });
  }, [sortedFormattedBalances, prices]);

  return (
    <div {...rest}>
      {rows}
    </div>
  );
};

export default WalletPage;