import React, { useMemo, useCallback } from 'react';

// Enhanced interfaces with proper typing
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string; // Added missing property
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

// Specific blockchain type for better type safety
type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo';

// Simplified Props interface - removed empty extension
interface Props extends BoxProps {
  // Could add wallet-specific props here if needed
}

const WalletPage: React.FC<Props> = (props) => {
  const { children, ...rest } = props; // Removed redundant type annotation
  const balances = useWalletBalances();
  const prices = usePrices();

  // Memoized function to prevent recreation on every render
  const getPriority = useCallback((blockchain: string): number => {
    switch (blockchain as Blockchain) {
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

  // Single memoized computation for filtered, sorted, and formatted balances
  const processedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const balancePriority = getPriority(balance.blockchain);
        // ✅ Fixed: Keep balances with positive amounts and valid priority
        return balancePriority > -99 && balance.amount > 0;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        
        // ✅ Fixed: Proper three-way comparison for stable sorting
        if (leftPriority > rightPriority) return -1;
        if (rightPriority > leftPriority) return 1;
        return 0; // Handle equal priorities
      })
      .map((balance: WalletBalance): FormattedWalletBalance => ({
        ...balance,
        formatted: balance.amount.toFixed(2) // Added decimal places for currency formatting
      }));
  }, [balances, getPriority]); // ✅ Fixed: Correct dependencies, removed unused 'prices'

  // Single map operation for rendering with proper typing
  const rows = useMemo(() => {
    return processedBalances.map((balance: FormattedWalletBalance) => {
      const usdValue = prices[balance.currency] * balance.amount;
      
      return (
        <WalletRow 
          className={classes.row}
          key={balance.currency} // ✅ Fixed: Use stable identifier instead of index
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={balance.formatted} // ✅ Fixed: Property now exists
        />
      );
    });
  }, [processedBalances, prices]); // Only depend on what's actually used

  return (
    <div {...rest}>
      {rows}
    </div>
  );
};

export default WalletPage;