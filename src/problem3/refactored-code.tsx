import React, { useMemo, useCallback } from 'react';
import { BoxProps } from '@mui/material'; // Assuming Material-UI Box

// Fixed interfaces with proper typing
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string; // Added missing property
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
  usdValue: number; // Added for better type safety
}

// Define blockchain type for better type safety
type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo';

// Props interface - only extend if actually needed
interface Props extends BoxProps {
  // Add specific props if needed, otherwise use BoxProps directly
}

const WalletPage: React.FC<Props> = (props) => {
  const { ...rest } = props; // Removed unused children destructuring
  const balances = useWalletBalances();
  const prices = usePrices();

  // Memoized priority function to avoid recalculation
  const getPriority = useCallback((blockchain: string): number => {
    const blockchainPriorities: Record<string, number> = {
      'Osmosis': 100,
      'Ethereum': 50,
      'Arbitrum': 30,
      'Zilliqa': 20,
      'Neo': 20,
    };
    
    return blockchainPriorities[blockchain] ?? -99;
  }, []);

  // Memoized processing of balances
  const processedBalances = useMemo(() => {
    // Filter and sort in one pass for better performance
    const validBalances = balances
      .filter((balance: WalletBalance) => {
        const balancePriority = getPriority(balance.blockchain);
        // Fixed logic: keep balances with positive amounts and valid priority
        return balancePriority > -99 && balance.amount > 0;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        
        // Fixed: complete sort function with all cases
        if (leftPriority > rightPriority) {
          return -1;
        } else if (rightPriority > leftPriority) {
          return 1;
        }
        return 0; // Equal priorities
      });

    // Transform to formatted balances with error handling
    return validBalances.map((balance: WalletBalance): FormattedWalletBalance => {
      const price = prices[balance.currency] ?? 0; // Default to 0 if price not found
      const usdValue = price * balance.amount;
      
      return {
        ...balance,
        formatted: balance.amount.toFixed(2), // Added decimal places for better formatting
        usdValue,
      };
    });
  }, [balances, prices, getPriority]); // Correct dependencies

  // Memoized rows to prevent unnecessary re-renders
  const rows = useMemo(() => {
    return processedBalances.map((balance: FormattedWalletBalance) => (
      <WalletRow 
        key={`${balance.currency}-${balance.blockchain}`} // Better key using unique combination
        amount={balance.amount}
        usdValue={balance.usdValue}
        formattedAmount={balance.formatted}
        currency={balance.currency}
        blockchain={balance.blockchain}
      />
    ));
  }, [processedBalances]);

  return (
    <div {...rest}>
      {rows}
    </div>
  );
};

// Enhanced WalletRow component interface for better type safety
interface WalletRowProps {
  amount: number;
  usdValue: number;
  formattedAmount: string;
  currency: string;
  blockchain: string;
}

// Example WalletRow component (assuming it doesn't exist)
const WalletRow: React.FC<WalletRowProps> = ({ 
  amount, 
  usdValue, 
  formattedAmount, 
  currency, 
  blockchain 
}) => (
  <div className="wallet-row">
    <span>{blockchain}</span>
    <span>{currency}</span>
    <span>{formattedAmount}</span>
    <span>${usdValue.toFixed(2)}</span>
  </div>
);

export default WalletPage; 