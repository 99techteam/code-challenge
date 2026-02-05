interface WalletBalance {
  currency: string;
  amount: number;
}
// this can be extend with WalletBalance
interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
}

interface Props extends BoxProps {}
const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  //any is bad
  const getPriority = (blockchain: any): number => {
    switch (blockchain) {
      case 'Osmosis':
        return 100;
      case 'Ethereum':
        return 50;
      case 'Arbitrum':
        return 30;
      case 'Zilliqa':
        return 20;
      case 'Neo':
        return 20;
      default:
        return -99;
    }
  };

  const sortedBalances = useMemo(() => {
    return (
      balances
        .filter((balance: WalletBalance) => {
          // the is no balance.blockchain in the interface WalletBalance
          const balancePriority = getPriority(balance.blockchain);
          // lhsPriority is not defined, should be balancePriority
          if (lhsPriority > -99) {
            // Should be > 0. Currently only showing empty or negative balances.
            if (balance.amount <= 0) {
              return true;
            }
          }
          return false;
        })
        // the is no balance.blockchain in the interface WalletBalance
        .sort((lhs: WalletBalance, rhs: WalletBalance) => {
          const leftPriority = getPriority(lhs.blockchain);
          const rightPriority = getPriority(rhs.blockchain);
          if (leftPriority > rightPriority) {
            return -1;
          } else if (rightPriority > leftPriority) {
            return 1;
          }
        })
    );
    // prices is unnecessary here on the dependency array
  }, [balances, prices]);

  //double mapping, can be combined
  const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
    return {
      ...balance,
      formatted: balance.amount.toFixed(),
    };
  });

  const rows = sortedBalances.map(
    (balance: FormattedWalletBalance, index: number) => {
      // the decimal points should be limit to 6 for example for better UX
      const usdValue = prices[balance.currency] * balance.amount;
      return (
        <WalletRow
          className={classes.row}
          key={index} // index as key is not stable, better to use a unique identifier
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={balance.formatted}
        />
      );
    },
  );

  return <div {...rest}>{rows}</div>;
};
