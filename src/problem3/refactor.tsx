interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}

interface Props extends BoxProps {}

const BLOCKCHAIN_PRIORITY: Record<string, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
} as const;

const DEFAULT_PRIORITY = -99;

const getPriority = (blockchain: string): number => {
  return BLOCKCHAIN_PRIORITY[blockchain] ?? DEFAULT_PRIORITY;
};

const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  const processedBalances = useMemo(() => {
    const validBalances = balances
      .map((balance) => ({
        balance,
        priority: getPriority(balance.blockchain),
      }))
      .filter(
        ({ priority, balance }) =>
          priority > DEFAULT_PRIORITY && balance.amount > 0
      );

    validBalances.sort((a, b) => b.priority - a.priority);

    return validBalances.map(({ balance }) => balance);
  }, [balances]);

  const rows = useMemo(() => {
    return processedBalances.map((balance) => {
      const usdValue = prices[balance.currency] * balance.amount;

      return (
        <WalletRow
          className={classes.row}
          key={`${balance.blockchain}-${balance.currency}`}
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={balance.amount.toFixed()}
        />
      );
    });
  }, [processedBalances, prices]);

  return <div {...rest}>{rows}</div>;
};
