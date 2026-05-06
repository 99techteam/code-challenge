import React, { memo, useMemo } from 'react';
import type { BoxProps } from '@mui/material';

type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo';

interface WalletBalance {
    id: string; // stable unique id for key
    currency: string;
    amount: number;
    blockchain: Blockchain;
}

interface WalletRowData extends WalletBalance {
    formatted: string;
    usdValue: number;
}

type WalletRowProps = WalletRowData & { className?: string };

const BLOCKCHAIN_PRIORITY: Record<Blockchain, number> = {
    Osmosis: 100,
    Ethereum: 50,
    Arbitrum: 30,
    Zilliqa: 20,
    Neo: 20,
};


const DEFAULT_PRIORITY = -99;

const getPriority = (blockchain: Blockchain): number =>
    BLOCKCHAIN_PRIORITY[blockchain] ?? DEFAULT_PRIORITY;

const useWalletBalances = (): WalletBalance[] => {
    return [
        { id: 'eth-usdc', currency: 'USDC', amount: 100, blockchain: 'Ethereum' },
        { id: 'osmo-usdc', currency: 'USDC', amount: 100, blockchain: 'Osmosis' },
        { id: 'arb-usdc', currency: 'USDC', amount: 100, blockchain: 'Arbitrum' },
    ];
};

const usePrices = (): Record<string, number> => {
    return {
        USDC: 1,
        OSMO: 0.5,
        ARB: 0.3,
        ZIL: 0.2,
        NEO: 0.1,
    };
};

const WalletRow = memo(function WalletRow({
    className,
    blockchain,
    currency,
    amount,
    usdValue,
    formatted,
}: WalletRowProps) {
    return (
        <div className={className}>
            <div>{blockchain}</div>
            <div>{currency}</div>
            <div>{amount}</div>
            <div>{usdValue}</div>
            <div>{formatted}</div>
        </div>
    );
});

type Props = BoxProps;

export default function WalletPage({ children, ...rest }: Props) {
    const balances = useWalletBalances();
    const prices = usePrices();

    const rows = useMemo<WalletRowData[]>(() => {
        return balances
            .filter((b) => getPriority(b.blockchain) > DEFAULT_PRIORITY && b.amount > 0)
            .slice()
            .sort((a, b) => {
                const priorityDiff = getPriority(b.blockchain) - getPriority(a.blockchain);
                if (priorityDiff !== 0) {
                    return priorityDiff;
                }
                // Stable tie-breaker so same-priority rows keep deterministic order.
                return a.currency.localeCompare(b.currency);
            })
            .map((b) => ({
                ...b,
                formatted: b.amount.toFixed(2),
                usdValue: (prices[b.currency] ?? 0) * b.amount,
            }));
    }, [balances, prices]);

    return (
        <div {...rest}>
            {rows.length === 0 ? (
                <div>No balances available.</div>
            ) : (
                rows.map((row) => (
                    <WalletRow
                        key={row.id}
                        className="flex flex-row items-center justify-between"
                        {...row}
                    />
                ))
            )}
            {children}
        </div>
    );
}