// Issue
// 1. WalletBalance missing type definition (blockchain)
// 2. lhsPriority is not defined, it should be balancePriority
// 3. WalletRow key should not be index
// 4. if (lhsPriority > -99) {
//    if (balance.amount <= 0) {
//      return true;
//    }
// } balance.amount should be grather than 0, can be simplified to if (lhsPriority > -99 && balance.amount > 0) {...}
// 5. const rows = sortedBalances.map((balance: FormattedWalletBalance, index: number) should be const rows = formattedBalances.map((balance: FormattedWalletBalance, index: number)
// 6. const getPriority = (blockchain: any): number, type blockchain should be string
// 7. sort function should return 0 if leftPriority === rightPriority
// 8. balance.amount.toFixed() should have a precision, e.g., balance.amount.toFixed(6)

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string; // Added missing type definition
}
interface FormattedWalletBalance {
  currency: string;
  blockchain: string; // Added missing type definition
  amount: number;
  formatted: string;
}

interface Props extends BoxProps {}
const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  const getPriority = (blockchain: string): number => {
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
        if (balancePriority > -99 && balance.amount > 0) {
          return true;
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
        return 0; // Return 0 if priorities are equal
      });
  }, [balances, prices]);

  const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
    return {
      ...balance,
      formatted: balance.amount.toFixed(6),
    };
  });

  const rows = formattedBalances.map(
    (balance: FormattedWalletBalance, index: number) => {
      const usdValue = prices[balance.currency] * balance.amount;
      return (
        <WalletRow
          className={classes.row}
          key={`${balance.blockchain}-${balance.currency}`}
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={balance.formatted}
        />
      );
    }
  );

  return <div {...rest}>{rows}</div>;
};
