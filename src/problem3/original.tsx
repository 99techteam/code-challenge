// ORIGINAL CODE WITH ISSUES
// =========================

interface WalletBalance {
  currency: string;
  amount: number;
}
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
    return balances
      .filter((balance: WalletBalance) => {
        const balancePriority = getPriority(balance.blockchain);
        if (lhsPriority > -99) {
          // Issue: lhsPriority is undefined
          if (balance.amount <= 0) {
            // Issue: keeps zero/negative amounts
            return true;
          }
        }
        return false;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        if (leftPriority > rightPriority) {
          return -1;
        } else if (rightPriority > leftPriority) {
          return 1;
        }
        // Issue: missing return for equal priorities
      });
  }, [balances, prices]); // Issue: prices not used in computation

  const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
    return {
      ...balance,
      formatted: balance.amount.toFixed(),
    };
  });
  // Issue: formattedBalances is created but never used

  const rows = sortedBalances.map(
    (balance: FormattedWalletBalance, index: number) => {
      // Issue: balance is WalletBalance, not FormattedWalletBalance
      const usdValue = prices[balance.currency] * balance.amount;
      return (
        <WalletRow
          className={classes.row}
          key={index} // Issue: using index as key
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={balance.formatted} // Issue: formatted doesn't exist
        />
      );
    }
  );

  return <div {...rest}>{rows}</div>;
};
