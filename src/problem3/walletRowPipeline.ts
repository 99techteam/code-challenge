import { UNKNOWN_PRIORITY, PRIORITY_BY_CHAIN } from './consts';
import type { Blockchain, WalletBalance, WalletRowViewModel } from './models';


export function getPriority(chain: Blockchain): number {
  return PRIORITY_BY_CHAIN[chain] ?? UNKNOWN_PRIORITY;
}

function isEligibleRow(priority: number, amount: number): boolean {
  return priority > UNKNOWN_PRIORITY && amount > 0;
}

function toWalletRowViewModel(
  balance: WalletBalance,
  prices: Readonly<Record<string, number>>,
): WalletRowViewModel {
  const unitUsd = prices[balance.currency] ?? 0;
  return {
    ...balance,
    formatted: balance.amount.toFixed(),
    usdValue: unitUsd * balance.amount,
  };
}

/**
 * Pure pipeline: filter by chain priority + positive amount, sort by priority,
 * attach formatted amount and USD. Keeps React out so this stays easy to unit test.
 */
export const buildWalletRowViewModels = (
  balances: readonly WalletBalance[],
  prices: Readonly<Record<string, number>>,
): WalletRowViewModel[] =>  balances
    .filter((balance) => isEligibleRow(getPriority(balance.blockchain), balance.amount))
    .toSorted((a, b) => getPriority(b.blockchain) - getPriority(a.blockchain) )
    .map((balance ) => toWalletRowViewModel(balance, prices));

