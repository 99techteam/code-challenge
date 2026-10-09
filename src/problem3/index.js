import { useMemo } from 'react';

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

interface Props extends BoxProps {}

const getPriority = (blockchain: string): number => {
  switch (blockchain) {
    case 'Osmosis':
      return 100;
    case 'Ethereum':
      return 50;
    case 'Arbitrum':
      return 30;
    case 'Zilliqa':
    case 'Neo':
      return 20;
    default:
      return -99;
  }
};

const WalletPage: React.FC<Props> = (props) => {
  const { children, ...rest } = props;
  const balances: WalletBalance[] = useWalletBalances();
  const prices: Record<string, number | undefined> = usePrices();

  const sortedBalances = useMemo(
    () =>
      balances
        .filter(
          (balance) =>
            getPriority(balance.blockchain) > -99 && balance.amount > 0,
        )
        .sort(
          (lhs, rhs) =>
            getPriority(rhs.blockchain) - getPriority(lhs.blockchain),
        ),
    [balances],
  );

  const formattedBalances: FormattedWalletBalance[] = sortedBalances.map(
    (balance) => ({
      ...balance,
      formatted: balance.amount.toFixed(),
    }),
  );

  const rows = formattedBalances.map((balance) => {
    const price = prices[balance.currency];
    const usdValue = price === undefined ? 0 : price * balance.amount;

    return (
      <WalletRow
        className={classes.row}
        key={`${balance.blockchain}:${balance.currency}`}
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.formatted}
      />
    );
  });

  return (
    <div {...rest}>
      {children}
      {rows}
    </div>
  );
};