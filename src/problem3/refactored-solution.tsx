import React, { useMemo } from "react";
import { BoxProps } from "@mui/material/Box";

// Type definitions
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string; // Added missing property
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
  usdValue: number;
  priority: number;
}

// Blockchain priority enum for better type safety
enum BlockchainPriority {
  OSMOSIS = 100,
  ETHEREUM = 50,
  ARBITRUM = 30,
  ZILLIQA = 20,
  NEO = 20,
  UNKNOWN = -99,
}

// Type-safe priority function
const getPriority = (blockchain: string): number => {
  switch (blockchain) {
    case "Osmosis":
      return BlockchainPriority.OSMOSIS;
    case "Ethereum":
      return BlockchainPriority.ETHEREUM;
    case "Arbitrum":
      return BlockchainPriority.ARBITRUM;
    case "Zilliqa":
      return BlockchainPriority.ZILLIQA;
    case "Neo":
      return BlockchainPriority.NEO;
    default:
      return BlockchainPriority.UNKNOWN;
  }
};

// Custom hook for wallet balances (assuming this exists)
const useWalletBalances = (): WalletBalance[] => {
  // Implementation would go here
  return [];
};

// Custom hook for prices (assuming this exists)
const usePrices = (): Record<string, number> => {
  // Implementation would go here
  return {};
};

// WalletRow component (assuming this exists)
const WalletRow: React.FC<{
  className?: string;
  amount: number;
  usdValue: number;
  formattedAmount: string;
}> = ({ className, amount, usdValue, formattedAmount }) => {
  return (
    <div className={className}>
      {formattedAmount} (${usdValue.toFixed(2)})
    </div>
  );
};

// Main component
const WalletPage: React.FC<BoxProps> = (props) => {
  const { ...rest } = props; // Remove unused children
  const balances = useWalletBalances();
  const prices = usePrices();

  // Single memoized operation that handles filtering, sorting, and formatting
  const processedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const priority = getPriority(balance.blockchain);
        // Filter out unknown blockchains and non-positive amounts
        return priority > BlockchainPriority.UNKNOWN && balance.amount > 0;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        return rightPriority - leftPriority; // Descending order
      })
      .map((balance: WalletBalance): FormattedWalletBalance => {
        const priority = getPriority(balance.blockchain);
        const usdValue = (prices[balance.currency] || 0) * balance.amount;

        return {
          ...balance,
          formatted: balance.amount.toFixed(2),
          usdValue,
          priority,
        };
      });
  }, [balances, prices]); // Include all dependencies

  // Memoized rows to prevent unnecessary re-renders
  const rows = useMemo(() => {
    return processedBalances.map((balance: FormattedWalletBalance) => (
      <WalletRow
        key={`${balance.currency}-${balance.blockchain}`} // Stable key
        amount={balance.amount}
        usdValue={balance.usdValue}
        formattedAmount={balance.formatted}
      />
    ));
  }, [processedBalances]);

  return <div {...rest}>{rows}</div>;
};

export default WalletPage;
