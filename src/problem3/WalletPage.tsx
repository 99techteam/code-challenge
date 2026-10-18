import React, { useMemo } from 'react';
import useWalletBalances from '@hooks/useWalletBalances';
import usePrices from '@hooks/usePrices';
import WalletRow from '@compoment/WalletRow';

type Blockchain =
    | 'Osmosis'
    | 'Ethereum'
    | 'Arbitrum'
    | 'Zilliqa'
    | 'Neo';

const PRIORITY: Record<Blockchain, number> = {
    Osmosis: 100,
    Ethereum: 50,
    Arbitrum: 30,
    Zilliqa: 20,
    Neo: 20,
};

interface WalletBalance {
    currency: string;
    amount: number;
    blockchain: Blockchain;
}
interface FormattedWalletBalance extends WalletBalance {
    formatted: string;
    usdValue: number;
}
interface Prices {
    [key: string]: number;
}
interface Props extends BoxProps {}

const WalletPage = (props: Props) => {
    const { ...rest } = props;
    const balances: WalletBalance[] = useWalletBalances<WalletBalance[]>();
    const prices = usePrices<Prices>();

    const sortedBalances: FormattedWalletBalance[] = useMemo(() => {
        return balances
            .filter(balance => balance.amount > 0)
            .sort((lhs, rhs) => {
			    const leftPriority = PRIORITY[lhs.blockchain] ?? -Infinity;
                const rightPriority = PRIORITY[rhs.blockchain] ?? -Infinity;

                return rightPriority - leftPriority;
            })
            .map(balance => ({
                ...balance,
                formatted: balance.amount.toFixed(6),
                usdValue: (prices[balance.currency] ?? 0) * balance.amount
            }));
      }, [balances, prices]);

    return (
        <div {...rest}>
            {sortedBalances.map(balance => (
                <WalletRow 
                    key={`wallet-row-${balance.blockchain}-${balance.currency}`}
                    amount={balance.amount}
                    usdValue={balance.usdValue}
                    formattedAmount={balance.formatted}
                />
            ))}
        </div>
    );
}

export default WalletPage;