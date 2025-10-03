import { useMemo } from 'react';
import type { WalletBalance } from '../types.ts';
import getPriority from '../utils/getPriority.ts';

interface FormattedWalletBalance extends WalletBalance {
    formatted: string;
}

function useSortedWalletBalances(balances: WalletBalance[]) {
    return useMemo<FormattedWalletBalance[]>(() => {
        return balances
            .filter((b) => b.amount > 0)
            .map((b) => ({
                ...b,
                formatted: b.amount.toFixed(),
            }))
            .sort(
                (a, b) => getPriority(b.blockchain) - getPriority(a.blockchain)
            );
    }, [balances]);
}

export default useSortedWalletBalances;
