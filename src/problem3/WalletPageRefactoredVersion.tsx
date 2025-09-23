/* eslint-disable */
// @ts-nocheck
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}
interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

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

interface WalletPageProps extends BoxProps {

}

const WalletPage: React.FC<Props> = (props: WalletPageProps) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  // Filter and sort balances
  const sortedBalances = useMemo(() => (
    balances
      .filter(b => getPriority(b.blockchain) > -99 && b.amount > 0)
      .sort((a, b) => getPriority(b.blockchain) - getPriority(a.blockchain))
  ), [balances]);

  // Format balances
  const formattedBalances: FormattedWalletBalance[] = sortedBalances.map(b => ({
    ...b,
    formatted: b.amount.toFixed(2)
  }));

  // Render rows
  const rows = formattedBalances.map((balance) => {
    const usdValue = (prices[balance.currency] || 0) * balance.amount;
    return (
      <WalletRow
        className={classes.row}
        key={balance.currency}
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.formatted}
      />
    );
  });

  return (
    <div {...rest}>
      {rows}
    </div>
  );
};