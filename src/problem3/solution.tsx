/**
 * Problem 3: Messy React - Solution & Analysis
 *
 * This file contains:
 * 1. The original messy code with 9 identified issues
 * 2. The refactored optimized version
 * 3. Detailed documentation in ANALYSIS.md
 *
 * TOTAL ISSUES FOUND: 9 bugs/anti-patterns
 * - 2 CRITICAL (causes runtime crash)
 * - 4 HIGH (performance/type issues)
 * - 3 MEDIUM (code quality)
 */

import React, { useMemo } from 'react';

// ============================================================================
// INTERFACES
// ============================================================================

interface WalletBalance {
  blockchain: string;
  currency: string;
  amount: number;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

// ============================================================================
// MOCK HOOKS (for demonstration)
// ============================================================================

const useWalletBalances = (): WalletBalance[] => [
  { blockchain: 'Osmosis', currency: 'OSMO', amount: 100 },
  { blockchain: 'Ethereum', currency: 'ETH', amount: 50 },
  { blockchain: 'Arbitrum', currency: 'ARB', amount: 200 },
  { blockchain: 'Zilliqa', currency: 'ZIL', amount: 0 },
  { blockchain: 'Neo', currency: 'NEO', amount: 75 },
  { blockchain: 'Unknown', currency: 'XXX', amount: 30 },
];

const usePrices = (): Record<string, number> => ({
  OSMO: 5.50,
  ETH: 3000,
  ARB: 1.20,
  ZIL: 0.05,
  NEO: 15,
  XXX: 0,
});

// ============================================================================
// ORIGINAL MESSY CODE - IDENTIFIED ISSUES:

// BUG #1: Variable 'lhsPriority' is undefined - causes ReferenceError
// BUG #2: 'prices' in dependency array but never used inside
// BUG #3: getPriority recreated on every render (inside component)
// BUG #4: Logic inverted - keeps balances <= 0, removes positive ones
// BUG #5: Array index as key - anti-pattern in React
// BUG #6: 'classes' used but never imported - causes ReferenceError
// BUG #7: formattedBalances computed but rows use sortedBalances
// BUG #8: 'any' type used instead of proper 'string' type
// BUG #9: Arbitrum case missing 'return' - falls through to Zilliqa

/*
const WalletPage: React.FC<Props> = (props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  const getPriority = (blockchain: any) => { // BUG #3, #8
    switch (blockchain) {
      case 'Osmosis': return 100;
      case 'Ethereum': return 50;
      case 'Arbitrum': 30; // BUG #9: missing return!
      case 'Zilliqa': return 20;
      case 'Neo': return 20;
      default: return -99;
    }
  };

  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance) => {
        if (lhsPriority > -99) { // BUG #1: undefined variable!
          return true;
        }
        if (balance.amount <= 0) { // BUG #4: inverted logic
          return true;
        }
        return false;
      })
      .sort((a, b) => {
        const aPriority = getPriority(a.blockchain);
        const bPriority = getPriority(b.blockchain);
        return bPriority - aPriority;
      });
  }, [balances, prices]); // BUG #2: prices unused

  const formattedBalances = useMemo(() => { // BUG #7: computed but unused
    return sortedBalances.map((balance) => ({
      ...balance,
      formatted: balance.amount.toFixed(),
    }));
  }, [sortedBalances]);

  const rows = formattedBalances.map((balance, index) => ( // BUG #5: index key
    <WalletRow
      className={classes.row} // BUG #6: classes undefined!
      key={index}
      amount={balance.amount}
      usdValue={prices[balance.currency] * balance.amount}
    />
  ));

  return <div {...rest}>{rows}</div>;
};
*/

// ============================================================================
// REFACTORED SOLUTION
// ============================================================================

/**
 * Priority mapping for different blockchains
 * Moved OUTSIDE the component to prevent recreation on every render
 */
const getPriority = (blockchain: string): number => {
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
};

/**
 * WalletPage Component - Refactored Version
 *
 * All issues from the original code have been fixed:
 * - Fixed undefined variable reference
 * - Corrected filter logic (show positive balances)
 * - Removed unused dependencies from useMemo
 * - Moved getPriority outside component
 * - Using unique keys instead of array indices
 * - Proper TypeScript typing
 */
const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  // FIXED: Single useMemo with correct dependencies
  // - Only depends on 'balances', not 'prices'
  // - Combines filter, sort, and map in one pass for better performance
  // - Filters out invalid priorities (-99) AND zero/negative amounts
  // - Correctly sorts by priority (descending)
  const formattedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const balancePriority = getPriority(balance.blockchain);
        // Keep only valid priorities and positive balances
        return balancePriority > -99 && balance.amount > 0;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        return getPriority(rhs.blockchain) - getPriority(lhs.blockchain);
      })
      .map((balance: WalletBalance): FormattedWalletBalance => ({
        ...balance,
        formatted: balance.amount.toFixed(),
      }));
  }, [balances]);

  // FIXED: Using currency as unique key instead of array index
  const rows = formattedBalances.map((balance: FormattedWalletBalance) => {
    const usdValue = (prices[balance.currency] || 0) * balance.amount;
    return (
      <WalletRow
        className="wallet-row"
        key={balance.currency}
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.formatted}
      />
    );
  });

  return <div {...rest}>{rows}</div>;
};

// ============================================================================
// PLACEHOLDER COMPONENT (for compilation)
// ============================================================================

interface WalletRowProps {
  className: string;
  key: string;
  amount: number;
  usdValue: number;
  formattedAmount: string;
}

const WalletRow: React.FC<WalletRowProps> = ({
  className,
  amount,
  usdValue,
  formattedAmount,
}) => (
  <div className={className}>
    <span>{formattedAmount}</span>
    <span>${usdValue.toFixed(2)}</span>
  </div>
);

export { WalletPage, WalletBalance, FormattedWalletBalance };
