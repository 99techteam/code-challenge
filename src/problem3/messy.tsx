import React, { useMemo } from 'react';

interface WalletBalance {
    currency: string;
    amount: number;
    // Add blockchain property, is used for getPriority func
    blockchain: Blockchain;
}

interface FormattedWalletBalance {
    currency: string;
    amount: number;
    formatted: string;
}

enum Blockchain {
    Osmosis = 'Osmosis',
    Ethereum = 'Ethereum',
    Arbitrum = 'Arbitrum',
    Zilliqa = 'Zilliqa',
    Neo = 'Neo',
}

// Mock types and components for demonstration
interface BoxProps {
    className?: string;
    children?: React.ReactNode;
}

//Naming need to be more specific -> Props => WalletPageProps
interface WalletPageProps extends BoxProps {

}

// Mock hooks - in real implementation these would come from actual libraries
const useWalletBalances = (): WalletBalance[] => {
    // Mock implementation
    return [];
};

const usePrices = (): Record<string, number> => {
    // Mock implementation
    return {};
};

// Mock WalletRow component
interface WalletRowProps {
    className?: string;
    key: string;
    amount: number;
    usdValue: number;
    formattedAmount: string;
}

const WalletRow: React.FC<WalletRowProps> = (props) => {
    return <div {...props} />;
};

// Mock classes object
const classes = {
    row: 'wallet-row'
};

// Priority constants for blockchain ranking
const BLOCKCHAIN_PRIORITIES: Record<Blockchain, number> = {
    [Blockchain.Osmosis]: 100,
    [Blockchain.Ethereum]: 50,
    [Blockchain.Arbitrum]: 30,
    [Blockchain.Zilliqa]: 20,
    [Blockchain.Neo]: 20,
};

const MINIMUM_PRIORITY = -99;

// Move getPriority outside component to prevent recreation on every render
const getPriority = (blockchain: Blockchain): number => {
    return BLOCKCHAIN_PRIORITIES[blockchain] ?? MINIMUM_PRIORITY;
};

const WalletPage: React.FC<WalletPageProps> = ({ ...rest }: WalletPageProps) => {
    const balances: WalletBalance[] = useWalletBalances();
    const prices: Record<string, number> = usePrices();

    // getPriority is called multiple times
    const formattedBalances = useMemo(() => {
      const enriched = balances.map(balance => ({
        ...balance,
        priority: getPriority(balance.blockchain),
      }));
        return enriched
            .filter(b => b.priority > MINIMUM_PRIORITY && b.amount > 0)
            .sort((a, b) => b.priority - a.priority)
            .map(({ priority, ...rest }): FormattedWalletBalance => ({
              ...rest,
              formatted: rest.amount.toFixed(2),
            }))
    }, [balances]);

    const rows = useMemo(() => {
        return formattedBalances.map((balance: FormattedWalletBalance) => {
            // Handle undefined currency with proper fallback
            const currencyKey = balance.currency || '';
            const usdValue = (prices[currencyKey] || 0) * balance.amount;
            return (
                <WalletRow
                    className={classes?.row}
                    key={balance.currency} // Use stable unique key instead of index
                    amount={balance.amount}
                    usdValue={usdValue}
                    formattedAmount={balance.formatted}
                />
            );
        });
    }, [formattedBalances, prices]);

    return (
        <div {...rest}>
            {rows}
        </div>
    )
}