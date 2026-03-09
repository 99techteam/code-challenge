/**
 * Hook: sorted and formatted wallet balances.
 * Only depends on balances — not prices — to avoid unnecessary recalc (per rules.md §7).
 */

import { useMemo } from 'react';
import { getSortedFormattedBalances } from '../utils/walletBalance';
import type { WalletBalance, FormattedWalletBalance } from '../types/wallet';

export function useSortedFormattedBalances(
  balances: WalletBalance[]
): FormattedWalletBalance[] {
  return useMemo(
    () => getSortedFormattedBalances(balances),
    [balances]
  );
}
