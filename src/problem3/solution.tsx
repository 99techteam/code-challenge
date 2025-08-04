import React, { useMemo } from 'react';
import { BoxProps } from '@mui/material';

// 🔧 Fixed: Added missing blockchain property with proper typing
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: BlockchainType;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
  usdValue: number; // Pre-calculate USD value for better performance
}

// 🔧 Fixed: Strong typing instead of 'any'
type BlockchainType = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo';

// 🔧 Fixed: Configuration object instead of magic numbers
const BLOCKCHAIN_PRIORITIES: Record<BlockchainType, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
} as const;

const DEFAULT_PRIORITY = -99;
const MIN_DISPLAY_AMOUNT = 0;

interface Props extends BoxProps {
  className?: string;
}

// 🔧 Fixed: Extract function outside component to prevent recreation
const getPriority = (blockchain: BlockchainType): number => {
  return BLOCKCHAIN_PRIORITIES[blockchain] ?? DEFAULT_PRIORITY;
};

// 🔧 Utility function for consistent formatting
const formatCurrency = (amount: number): string => {
  return amount.toFixed(2);
};

// 🔧 Safe USD calculation with fallback
const calculateUsdValue = (amount: number, pricePerUnit: number | undefined): number => {
  return (pricePerUnit ?? 0) * amount;
};

const WalletPage: React.FC<Props> = ({ children, ...rest }) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  // 🔧 Fixed: Correct filtering logic and proper dependencies
  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const balancePriority = getPriority(balance.blockchain);
        // 🔧 Fixed: Keep balances with valid priority AND positive amount
        return balancePriority > DEFAULT_PRIORITY && balance.amount > MIN_DISPLAY_AMOUNT;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        // 🔧 Fixed: Simplified descending sort with proper return for equal values
        return rightPriority - leftPriority;
      });
  }, [balances]); // 🔧 Fixed: Removed prices from dependencies

  // 🔧 Fixed: Single-pass processing with proper memoization
  const formattedBalances = useMemo(() => {
    return sortedBalances.map((balance: WalletBalance): FormattedWalletBalance => ({
      ...balance,
      formatted: formatCurrency(balance.amount),
      usdValue: calculateUsdValue(balance.amount, prices[balance.currency]),
    }));
  }, [sortedBalances, prices]); // 🔧 Fixed: Correct dependencies

  // 🔧 Fixed: Use formattedBalances and proper memoization
  const rows = useMemo(() => {
    return formattedBalances.map((balance: FormattedWalletBalance) => (
      <WalletRow
        key={`${balance.currency}-${balance.blockchain}`} // 🔧 Fixed: Stable, unique key
        className="wallet-row" // 🔧 Fixed: Define proper CSS class
        amount={balance.amount}
        usdValue={balance.usdValue}
        formattedAmount={balance.formatted}
        currency={balance.currency}
        blockchain={balance.blockchain}
      />
    ));
  }, [formattedBalances]);

  return (
    <div {...rest}>
      {rows}
    </div>
  );
};

// 🔧 Optimized: Memoized WalletRow component
interface WalletRowProps {
  amount: number;
  usdValue: number;
  formattedAmount: string;
  currency: string;
  blockchain: BlockchainType;
  className?: string;
}

const WalletRow = React.memo<WalletRowProps>(({
  amount,
  usdValue,
  formattedAmount,
  currency,
  blockchain,
  className
}) => {
  return (
    <div className={className} data-testid={`wallet-${currency}`}>
      <div className="wallet-row__currency">{currency}</div>
      <div className="wallet-row__amount">{formattedAmount}</div>
      <div className="wallet-row__usd-value">${usdValue.toFixed(2)}</div>
      <div className="wallet-row__blockchain">{blockchain}</div>
    </div>
  );
});

WalletRow.displayName = 'WalletRow';

export default WalletPage;
