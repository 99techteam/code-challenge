// Missing import of "React, {useMemo}"
// Missing import of "WalletRow" component

interface WalletBalance {
  currency: string;
  amount: number;
  // missing "blockchain" key (done)
}
interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
}

// missing import "BoxProps"
interface Props extends BoxProps {}

const WalletPage: React.FC<Props> = (props: Props) => {
  // children is destructured but never used (done)
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  // blockchain need type (done)
  const getPriority = (blockchain: any): number => {
    switch (blockchain) {
      case "Osmosis":
        return 100;
      case "Ethereum":
        return 50;
      case "Arbitrum":
        return 30;
      case "Zilliqa":
        return 20;
      case "Neo":
        return 20;
      default:
        return -99;
    }
  };

  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const balancePriority = getPriority(balance.blockchain);
        // lhsPriority is not defined (done)
        if (lhsPriority > -99) {
          // logic is inverted (done)
          if (balance.amount <= 0) {
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
        // missing return (done)
      });
  }, [balances, prices]);
  // "prices" is not used in useMemo (done)

  // formattedBalances is not used (done)
  const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
    return {
      ...balance,
      formatted: balance.amount.toFixed(),
    };
  });

  // should use "formattedBalances" insteaded of "sortedBalances"
  // because we used (balance:FormattedWalletBalance) (done)
  const rows = sortedBalances.map(
    (balance: FormattedWalletBalance, index: number) => {
      const usdValue = prices[balance.currency] * balance.amount;
      return (
        <WalletRow
          // No classes object is defined or imported.(done)
          className={classes.row}
          // should use a stable unique identifier (done)
          key={index} // Anti-Pattern (done)
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={balance.formatted}
        />
      );
    },
  );

  return <div {...rest}>{rows}</div>;
};
