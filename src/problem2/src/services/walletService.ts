import type { TokenBalance } from '../types';

/**
 * Get balance for a specific token
 */
export function getTokenBalance(
    wallet: TokenBalance[],
    symbol: string
): number {
    const balance = wallet.find(b => b.symbol === symbol);
    return balance?.balance || 0;
}
