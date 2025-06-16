interface WalletBalance {
  currency: string;
  amount: number;
}
// repeated fields  the interface for the formatted balance,
//  should have extends the WalletBalance interface
interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
}

//no need to extend if Props is empty, should use BoxProps directly if exists,
// BoxProps should extends PropsWithChildren to avoid manually adding children into the interface
interface Props extends BoxProps {}

const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances(); // presume this hook exists, and balances is an array of WalletBalance
  const prices = usePrices(); // presume this hook exists

  //using any is very bad practice, use string or enum or union type instead
  // could use a Record or an object instead of switch case
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
        // blockchain is not defined, should be added to the WalletBalance interface, or using the currency field
        // combined with the getPriority function, the currency field type should be an enum if using currency field instead of blockchain
        const balancePriority = getPriority(balance.blockchain);
        // lhsPriority is not defined, should be balancePriority
        if (lhsPriority > -99) {
          // this condition could be non-logical and not following the user's requirement
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

        //mising case where rightPriority is equal to leftPriority
      });
    //   prices is not used, should be removed from the dependency array
  }, [balances, prices]);

  //   this loop is not cached, could hurt performance if data is large,
  //  should be cached in the usememo above
  const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
    return {
      ...balance,
      formatted: balance.amount.toFixed(), //should add number of decimal places
    };
  });

  const rows = sortedBalances.map(
    // balance in sortedBalances is not FormattedWalletBalance, should be FormattedWalletBalance
    (balance: FormattedWalletBalance, index: number) => {
      // unknown type of prices, could throw an error, could add a fallback value
      const usdValue = prices[balance.currency] * balance.amount;
      return (
        <WalletRow
          className={classes.row}
          //   insufficent index, should be balance.currency, or any combination that is unique
          key={index}
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={balance.formatted}
        />
      );
    }
  );
  // adding all the props to the div is not good practice
  // should only pass the props that are needed
  //   if BoxProps comes from a library, it could be reasonable
  return <div {...rest}>{rows}</div>;
};

// missing component export
