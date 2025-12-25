/**
 * WalletPage Component - Refactored Version
 *
 * This component displays a list of wallet balances sorted by blockchain priority.
 * All computational inefficiencies and anti-patterns from the original code have been addressed.
 */

import React, { useMemo } from 'react';
import { useWalletBalances } from '../hooks/useWalletBalances';
import { usePrices } from '../hooks/usePrices';
import { WalletRow } from './WalletRow';
import type { BoxProps } from '../types';
import {
  filterValidBalances,
  sortBalancesByPriority,
  formatBalances,
} from '../utils/balanceHelpers';

interface WalletPageProps extends BoxProps {
  className?: string;
}

/**
 * WalletPage component - main component for displaying wallet balances
 *
 * Improvements made:
 * 1. getPriority moved outside component to prevent recreation
 * 2. Proper TypeScript types instead of 'any'
 * 3. Fixed filter logic (keeps positive amounts only)
 * 4. Removed unused 'prices' from useMemo dependencies
 * 5. Fixed type mismatch by using formattedBalances for rendering
 * 6. Used proper keys (currency + blockchain) instead of index
 * 7. Removed unused 'children' prop
 * 8. Separated concerns into utility functions
 * 9. Proper memoization strategy
 */
export const WalletPage: React.FC<WalletPageProps> = ({
  className = '',
  ...rest
}) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  // Memoize the sorted and formatted balances
  // Only recalculates when balances change (prices not needed for sorting/filtering)
  const formattedBalances = useMemo(() => {
    // Step 1: Filter out invalid balances (amount <= 0 or priority === -99)
    const validBalances = filterValidBalances(balances);

    // Step 2: Sort by blockchain priority (highest first)
    const sortedBalances = sortBalancesByPriority(validBalances);

    // Step 3: Format balances with formatted amount strings
    return formatBalances(sortedBalances);
  }, [balances]);

  // Render wallet rows with proper keys and USD value calculation
  const rows = formattedBalances.map((balance) => {
    const usdValue = prices[balance.currency]
      ? prices[balance.currency] * balance.amount
      : 0;

    // Use currency + blockchain as key for stable, unique identification
    const key = `${balance.currency}-${balance.blockchain}`;

    return <WalletRow key={key} balance={balance} usdValue={usdValue} />;
  });

  return (
    <>
      <h1 className='wallet-page-title'>Wallet Page</h1>
      <div
        className={`wallet-page ${className}`}
        role='main'
        aria-label='Wallet balances'
        {...rest}
      >
        <div role='grid' aria-label='Wallet balance list'>
          {rows.length > 0 ? (
            rows
          ) : (
            <div
              className='wallet-empty-state'
              role='status'
              aria-live='polite'
            >
              No balances available
            </div>
          )}
        </div>
      </div>
    </>
  );
};
