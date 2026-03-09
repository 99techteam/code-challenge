/**
 * Pure wallet balance logic — testable, no UI (per rules.md: separation of concerns).
 */

import type { Blockchain, WalletBalance, FormattedWalletBalance } from '../types/wallet';

const BLOCKCHAIN_PRIORITY: Record<Blockchain, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

const DEFAULT_PRIORITY = -99;

export function getPriority(blockchain: Blockchain): number {
  return BLOCKCHAIN_PRIORITY[blockchain] ?? DEFAULT_PRIORITY;
}

/**
 * Filter balances: known blockchain and positive amount.
 * (Original kept zero/negative — likely bug; adjust rule if product needs otherwise.)
 */
export function filterBalances(balances: WalletBalance[]): WalletBalance[] {
  return balances.filter((balance) => {
    const priority = getPriority(balance.blockchain);
    return priority > DEFAULT_PRIORITY && balance.amount > 0;
  });
}

/**
 * Sort by priority descending (higher first).
 * Comparator returns -1 | 0 | 1 for stable sort.
 */
export function sortBalancesByPriority(balances: WalletBalance[]): WalletBalance[] {
  return [...balances].sort((lhs, rhs) => {
    const leftPriority = getPriority(lhs.blockchain);
    const rightPriority = getPriority(rhs.blockchain);
    if (leftPriority > rightPriority) return -1;
    if (rightPriority > leftPriority) return 1;
    return 0;
  });
}

export function formatBalance(balance: WalletBalance): FormattedWalletBalance {
  return {
    ...balance,
    formatted: balance.amount.toFixed(),
  };
}

export function getSortedFormattedBalances(balances: WalletBalance[]): FormattedWalletBalance[] {
  const filtered = filterBalances(balances);
  const sorted = sortBalancesByPriority(filtered);
  return sorted.map(formatBalance);
}
