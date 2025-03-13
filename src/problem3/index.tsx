const WalletPriority = {
    Osmosis: 100,
    Ethereum: 50,
    Arbitrum: 30,
    Zilliqa: 20,
    Binance: 10,
}
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string; 
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

const WalletPage: React.FC<Props> = ({ children, ...rest }) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  const getPriority = useCallback((blockchain: string): number => {
    if (!WalletPriority[blockchain]) return -99;
    return WalletPriority[blockchain];
  }, []);

  const sortedBalances = useMemo(() => {
    const withPriority = balances
      .map((balance) => ({
        ...balance,
        priority: getPriority(balance.blockchain),
      }))
      .filter((balance) => balance.priority > -99 && balance.amount > 0);

    return withPriority.sort((lhs, rhs) => rhs.priority - lhs.priority);
  }, [balances, getPriority]);

  const rows = sortedBalances.map((balance) => {
    const usdValue = prices[balance.currency] * balance.amount;
    const formattedAmount = balance.amount.toFixed();
    return (
      <WalletRow
        className={classes.row}
        key={balance.currency + balance.amount} 
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={formattedAmount}
      />
    );
  });

  return <div {...rest}>{rows}</div>;
};
