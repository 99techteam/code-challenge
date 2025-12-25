/**
 * Utility functions for balance processing
 */

import type { WalletBalance, FormattedWalletBalance } from '../types';
import { getPriority } from './blockchainPriority';

/**
 * Filters balances to only include those with positive amounts and valid priority
 * @param balances - Array of wallet balances
 * @returns Filtered balances with amount > 0 and priority > -99
 */
export const filterValidBalances = (balances: WalletBalance[]): WalletBalance[] => {
  return balances.filter((balance) => {
    const priority = getPriority(balance.blockchain);
    return priority > -99 && balance.amount > 0;
  });
};

/**
 * Sorts balances by blockchain priority (highest first)
 * Uses memoized priority lookup for efficiency
 * @param balances - Array of wallet balances to sort
 * @returns Sorted balances array
 */
export const sortBalancesByPriority = (balances: WalletBalance[]): WalletBalance[] => {
  return [...balances].sort((a, b) => {
    const leftPriority = getPriority(a.blockchain);
    const rightPriority = getPriority(b.blockchain);
    return rightPriority - leftPriority; // Descending order (highest first)
  });
};

/**
 * Formats a balance amount to a string with fixed decimal places
 * @param amount - The numeric amount
 * @returns Formatted string representation
 */
export const formatBalance = (amount: number): string => {
  return amount.toFixed(2);
};

/**
 * Formats wallet balances by adding formatted amount string
 * @param balances - Array of wallet balances
 * @returns Array of formatted wallet balances
 */
export const formatBalances = (balances: WalletBalance[]): FormattedWalletBalance[] => {
  return balances.map((balance) => ({
    ...balance,
    formatted: formatBalance(balance.amount),
  }));
};

