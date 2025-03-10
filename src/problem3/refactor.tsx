interface WalletBalance {
  id: number;  
  currency: string;
  amount: number;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

const BLOCKCHAIN_PRIORITY_MAP = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

const getPriority = (blockchain: string): number =>
  BLOCKCHAIN_PRIORITY_MAP[blockchain] ?? -99;

const WalletPage = (props: BoxProps) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  const sortedBalances = useMemo(() => {
    return balances
      .filter(
        (balance: WalletBalance) =>
          getPriority(balance.blockchain) > -99 && balance.amount <= 0
      )
      .sort(
        (lhs: WalletBalance, rhs: WalletBalance) =>
          getPriority(rhs.blockchain) - getPriority(lhs.blockchain)
      )
      .map((balance: WalletBalance) => ({
        ...balance,
        formatted: balance.amount.toFixed(),
      }));
  }, [balances]);

  const rows = sortedBalances.map(
    (balance: FormattedWalletBalance) => (
      <WalletRow
        className={classes.row}
        key={balance.id}
        amount={balance.amount}
        usdValue={prices[balance.currency] * balance.amount}
        formattedAmount={balance.formatted}
      />
    )
  );

  return <div {...rest}>{rows}</div>;
};
