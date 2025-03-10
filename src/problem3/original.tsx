// We specify the unique id for each balance to differenciate between them
interface WalletBalance {
    currency: string;
    amount: number;
}

// We can define this interface by extending the WalletBalance interface above
// Case they have same props currency/amount
interface FormattedWalletBalance {
    currency: string;
    amount: number;
    formatted: string;
}

// The Props interface does not have any other props beside the BoxProps 
// so we can just use the BoxProps as Props 
interface Props extends BoxProps {

}


const WalletPage: React.FC<Props> = (props: Props) => {
    const { children, ...rest } = props;
    const balances = useWalletBalances();
    const prices = usePrices();

    // This function is util function, so we should move this one outside component
    const getPriority = (blockchain: any): number => {
        // We can refactor this code block by using a key, value object 
        switch (blockchain) {
            case 'Osmosis':
                return 100
            case 'Ethereum':
                return 50
            case 'Arbitrum':
                return 30
            case 'Zilliqa':
                return 20
            case 'Neo':
                return 20
            default:
                return -99
        }
    }

    const sortedBalances = useMemo(() => {
        return balances.filter((balance: WalletBalance) => {
            const balancePriority = getPriority(balance.blockchain);
            // We can reduce lines of code by just using 1 return
            if (lhsPriority > -99) {
                if (balance.amount <= 0) {
                    return true;
                }
            }
            return false
        }).sort((lhs: WalletBalance, rhs: WalletBalance) => {
            // We can reduce lines of code by just using 1 return
            const leftPriority = getPriority(lhs.blockchain);
            const rightPriority = getPriority(rhs.blockchain);
            if (leftPriority > rightPriority) {
                return -1;
            } else if (rightPriority > leftPriority) {
                return 1;
            }
        });
        // We don't to listen the prices change, cause it is not used in this useMemo's callback
    }, [balances, prices]);

    // The formattedBalances is not used so we can remove it and update the formatted value in useMemo above
    const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
        return {
            ...balance,
            formatted: balance.amount.toFixed()
        }
    })

    const rows = sortedBalances.map((balance: FormattedWalletBalance, index: number) => {
        // We can move this line to usdValue prop and no need to define a variable for this
        // Just small enhancement to make code shorter
        const usdValue = prices[balance.currency] * balance.amount;
        return (
            <WalletRow
                className={classes.row}
                // Should not use index as key, it can potentially affect the Virtual DOM to detect changes when rendering the list
                // Instead we should use currency-amount
                key={index}
                amount={balance.amount}
                usdValue={usdValue}
                formattedAmount={balance.formatted}
            />
        )
    })

    return (
        <div {...rest}>
            {rows}
        </div>
    )
}