1. No recommend Filter + Sort logic
    - We should optimize logic to filter this list or we can filter before pass to component or handle filter in step prepare this data.

2. Redundant dependencies in useMemo.
    - We didn't used prices into callback function then it shouldn't have into array dependencies.

3. Repeated `getPriority` function calls
    - We can combine and return a tuple and handle logic into a function to reduce the number of functions called.

4. No recommend use index for key in list
    - We should have prefix or postfix for key on each items

5. Wrong use property without define in interface
```
(balance: WalletBalance) => {
  const balancePriority = getPriority(balance.blockchain);
}
```
The interface **WalletBalance** don't have property **blockchain**

6. Should use useMemo for `formattedBalances`
    - This's a high cost excution and we should reduce the number of re-excuted while component re-render
7. Wrong value using to map item not formatted.
    - **sortedBalances** is a variable of type `WalletBallance[]`, not `FormattedWalletBalance[]`.



## This's the refactor code.
```
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string; // Added for correct usage
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

interface Props extends BoxProps {}

const getPriority = (blockchain: string): number => {
  switch (blockchain) {
    case 'Osmosis': return 100;
    case 'Ethereum': return 50;
    case 'Arbitrum': return 30;
    case 'Zilliqa':
    case 'Neo': return 20;
    default: return -99;
  }
};

const WalletPage: React.FC<Props> = (props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance) => getPriority(balance.blockchain) > -99 && balance.amount > 0)
      .sort((a, b) => getPriority(b.blockchain) - getPriority(a.blockchain));
  }, [balances]);

  const formattedBalances: FormattedWalletBalance[] = useMemo(() => {
    return sortedBalances.map((balance) => ({
      ...balance,
      formatted: balance.amount.toFixed(2),
    }));
  }, [sortedBalances]);

  const rows = formattedBalances.map((balance) => {
    const usdValue = prices[balance.currency] * balance.amount;
    return (
      <WalletRow
        className={classes.row}
        key={balance.currency} // better key than index
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.formatted}
      />
    );
  });

  return <div {...rest}>{rows}</div>;
};

```