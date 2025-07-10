interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}

const priorityMap: Record<string, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

interface Classes {
  row: string;
  wrapper: string;
}

interface Props extends BoxProps {
  classes: Classes;
}
export const WalletPage: React.FC<Props> = (props: Props) => {
  const { classes } = props;
  const { data: balances } = useWalletBalances();
  const { data: prices } = usePrices();

  const getPriority = (blockchain: string): number => {
    return priorityMap[blockchain] ?? -99;
  };

  const sortedBalances: WalletBalance[] = useMemo(() => {
    return balances
      .filter(
        ({ amount, blockchain }) => getPriority(blockchain) > -99 && amount > 0
      )
      .sort(
        (lhs: WalletBalance, rhs: WalletBalance) =>
          getPriority(lhs.blockchain) - getPriority(rhs.blockchain)
      );
  }, [balances]);

  const rows = sortedBalances.map((balance: WalletBalance) => {
    const usdValue = prices[balance.currency] * balance.amount;
    const formatted = balance.amount.toFixed();
    return (
      <WalletRow
        className={classes.row}
        key={balance.blockchain}
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={formatted}
      />
    );
  });

  return <div className={classes.wrapper}>{rows}</div>;
};
