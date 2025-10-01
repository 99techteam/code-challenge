import React, { useMemo } from 'react';
import { BoxProps } from '@mui/material'; // Assuming Material-UI

// Fixed interface with missing blockchain property
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string; // Added missing property
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

// Moved outside component to prevent recreation on every render
const getPriority = (blockchain: string): number => {
  switch (blockchain) {
    case 'Osmosis':
      return 100;
    case 'Ethereum':
      return 50;
    case 'Arbitrum':
      return 30;
    case 'Zilliqa':
      return 20;
    case 'Neo':
      return 20;
    default:
      return -99;
  }
};

// Simplified props interface
interface WalletPageProps extends BoxProps {
  // Add specific props if needed
}

const WalletPage: React.FC<WalletPageProps> = ({ children, ...rest }) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  const sortedAndFormattedBalances = useMemo(() => {
    // Early return if no balances
    if (!balances || balances.length === 0) {
      return [];
    }

    return balances
      .filter((balance: WalletBalance) => {
        const balancePriority = getPriority(balance.blockchain);
        // Fixed: Filter for positive amounts and valid priorities
        return balancePriority > -99 && balance.amount > 0;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);

        // Fixed: Complete sort comparator with all cases
        if (leftPriority > rightPriority) {
          return -1;
        } else if (rightPriority > leftPriority) {
          return 1;
        }
        return 0; // Added missing case for equal priorities
      })
      .map(
        (balance: WalletBalance): FormattedWalletBalance => ({
          ...balance,
          formatted: balance.amount.toFixed(2), // Added precision for better formatting
        })
      );
  }, [balances]); // Removed prices from dependencies as it's not used in computation

  // Single mapping operation instead of double mapping
  const rows = useMemo(() => {
    if (!prices) {
      return []; // Handle case where prices might be undefined
    }

    return sortedAndFormattedBalances.map((balance: FormattedWalletBalance) => {
      const usdValue = prices[balance.currency] * balance.amount;

      return (
        <WalletRow
          key={`${balance.currency}-${balance.blockchain}`} // Fixed: Use meaningful key instead of index
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={balance.formatted}
        />
      );
    });
  }, [sortedAndFormattedBalances, prices]);

  return <div {...rest}>{rows}</div>;
};

export default WalletPage;

// Alternative implementation with error handling and loading states
const WalletPageWithErrorHandling: React.FC<WalletPageProps> = ({
  children,
  ...rest
}) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  const { sortedBalances, isLoading, error } = useMemo(() => {
    // Handle loading and error states
    if (!balances || !prices) {
      return { sortedBalances: [], isLoading: true, error: null };
    }

    try {
      const filtered = balances.filter((balance: WalletBalance) => {
        const balancePriority = getPriority(balance.blockchain);
        return balancePriority > -99 && balance.amount > 0;
      });

      const sorted = filtered.sort((lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);

        if (leftPriority > rightPriority) return -1;
        if (rightPriority > leftPriority) return 1;
        return 0;
      });

      const formatted = sorted.map(
        (balance: WalletBalance): FormattedWalletBalance => ({
          ...balance,
          formatted: balance.amount.toFixed(2),
        })
      );

      return { sortedBalances: formatted, isLoading: false, error: null };
    } catch (err) {
      return { sortedBalances: [], isLoading: false, error: err as Error };
    }
  }, [balances, prices]);

  if (isLoading) {
    return <div>Loading wallet balances...</div>;
  }

  if (error) {
    return <div>Error loading wallet balances: {error.message}</div>;
  }

  const rows = sortedBalances.map((balance: FormattedWalletBalance) => {
    const usdValue = prices[balance.currency] * balance.amount;

    return (
      <WalletRow
        key={`${balance.currency}-${balance.blockchain}`}
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.formatted}
      />
    );
  });

  return <div {...rest}>{rows}</div>;
};

export { WalletPageWithErrorHandling };
