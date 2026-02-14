/**
 * Problem 3: Messy React Code - ORIGINAL (WITH ISSUES)
 * 
 * This file contains the original code with all its issues.
 * See ANALYSIS.md for detailed issue explanations.
 * See WalletPage.refactored.tsx for the fixed version.
 */

import React, { useMemo } from 'react';
import { Box, BoxProps } from '@mui/material';

// ❌ ISSUES IN THIS CODE:
// 1. Missing/incorrect TypeScript types
// 2. Logic errors
// 3. Performance issues
// 4. Code quality problems
// See ANALYSIS.md for details

interface WalletBalance {
  currency: string;
  amount: number;
}

interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
}

interface Props extends BoxProps {
  // ❌ Empty interface - BoxProps might not be defined
}

const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  // ❌ Issue: children is destructured but never used
  
  const balances = useWalletBalances();
  const prices = usePrices();

  // ❌ Issue 1: Parameter type is 'any' - no type safety
  const getPriority = (blockchain: any): number => {
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

  // ❌ Issue 2: Multiple logic and performance errors
  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const balancePriority = getPriority(balance.blockchain);
        // ❌ Issue 2.1: Variable 'lhsPriority' is not defined!
        // ❌ Issue 2.2: Logic is inverted (returns true for amount <= 0)
        if (lhsPriority > -99) {
          if (balance.amount <= 0) {
            return true; // ❌ Filters OUT positive balances!
          }
        }
        return false;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain);
        // ❌ Issue 2.3: Tên biến lhs/rhs không rõ ràng
        const rightPriority = getPriority(rhs.blockchain);
        if (leftPriority > rightPriority) {
          return -1;
        } else if (rightPriority > leftPriority) {
          return 1;
        }
        // ❌ Issue 2.4: Missing return 0 for equal case
      });
  }, [balances, prices]); // ❌ Issue 3: prices in dependency but not used

  // ❌ Issue 4: formattedBalances created but never used
  const formattedBalances = sortedBalances.map(
    (balance: WalletBalance) => {
      return {
        ...balance,
        // ❌ Issue 5: toFixed() with no parameter = integer only
        formatted: balance.amount.toFixed(),
      };
    }
  );

  // ❌ Issue 6: Map from sortedBalances (not formattedBalances)
  // ❌ Issue 7: Type mismatch - balance doesn't have 'formatted' property
  const rows = sortedBalances.map(
    (balance: FormattedWalletBalance, index: number) => {
      const usdValue = prices[balance.currency] * balance.amount;
      return (
        <WalletRow
          className={classes.row}
          // ❌ Issue 8: Using index as key - anti-pattern
          key={index}
          amount={balance.amount}
          usdValue={usdValue}
          // ❌ Issue: balance.formatted doesn't exist on sortedBalances
          formattedAmount={balance.formatted}
        />
      );
    }
  );

  return <div {...rest}>{rows}</div>;
};

export default WalletPage;
