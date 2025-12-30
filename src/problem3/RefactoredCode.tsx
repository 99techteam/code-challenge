import React, { useMemo } from 'react';

interface WalletBalance {
    currency: string;
    amount: number;
    blockchain?: string;
}

interface FormattedWalletBalance extends WalletBalance {
    formatted: string;
    usdValue: number;
}

interface Props extends BoxProps {
    children?: ReactNode;
  ...rest: any;
}

const PRIORITIES = {
    Osmosis: 100,
    Ethereum: 50,
    Arbitrum: 30,
    Zilliqa: 20,
    Neo: 20,
} as const;

const getPriority = (blockchain?: string): number => PRIORITIES[blockchain as keyof typeof PRIORITIES] ?? -99;

const WalletPage: React.FC<Props> = ({ children, ...rest }) => {
    const balances = useWalletBalances();
    const prices = usePrices();

    const processedBalances = useMemo(() =>
        balances
            .filter(({ blockchain, amount }) => getPriority(blockchain) > -99 && amount > 0)
            .sort((a, b) => {
                const aPriority = getPriority(a.blockchain);
                const bPriority = getPriority(b.blockchain);
                return bPriority - aPriority || 0;
            })
            .map((balance: WalletBalance): FormattedWalletBalance => ({
                ...balance,
                formatted: balance.amount.toFixed(2),
                usdValue: (prices[balance.currency] ?? 0) * balance.amount,
            })),
        [balances, prices]
    );

    return (
        <div {...rest}>
            {processedBalances.map((balance, index) => (
                <WalletRow
                    key={`${balance.currency}-${balance.blockchain || index}`}
                    className={classes.row}
                    amount={balance.amount}
                    usdValue={balance.usdValue}
                    formattedAmount={balance.formatted}
                />
            ))}
        </div>
    );
};

export default WalletPage; 