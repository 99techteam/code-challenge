import React from 'react';
import useSortedWalletBalances from './hooks/useSortBalances.ts';
import useWalletBalances from './hooks/useWalletBalances';
import usePrices from './hooks/usePrices';
import WalletRow from './components/WalletRow.tsx';

interface Props extends BoxProps {}

const WalletPage: React.FC<Props> = (props: Props) => {
    const { ...rest } = props;
    const balances = useWalletBalances();
    const prices = usePrices();
    const sortedBalances = useSortedWalletBalances(balances);

    return (
        <div {...rest}>
            {sortedBalances.map((balance) => {
                const usdPrice = prices[balance.currency] ?? 0;
                const usdValue = usdPrice * balance.amount;

                return (
                    <WalletRow
                        className={classes.row}
                        key={`${balance.currency}-${balance.blockchain}`} // use stable key
                        amount={balance.amount}
                        usdValue={usdValue}
                        formattedAmount={balance.formatted}
                    />
                );
            })}
        </div>
    );
};

export default WalletPage;
