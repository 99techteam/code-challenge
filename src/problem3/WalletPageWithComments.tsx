// 1. Missing field blockchain which is used to calculate priority
interface WalletBalance {
  currency: string;
  amount: number;
}
// 2. Should extends from WalletBalance to avoid duplication in currency and amount field but we will remove this because of issue #11
interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
}

interface Props extends BoxProps {}
const WalletPage: React.FC<Props> = (props: Props) => { // 3. Missing export for this component
  const { children, ...rest } = props; // 4. Assume BoxProps has children field but children is declared but its value is never read
  const balances = useWalletBalances();
  const prices = usePrices();

  // 5. Could change the switch case to makes it easy to add, remove, or update priorities, param blockchain should have type string
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
        if (lhsPriority > -99) { // 6. Use balancePriority because lhsPriority is not defined
          if (balance.amount <= 0) { // Could refactor to combine conditions
            return true;
          }
        }
        return false;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        if (leftPriority > rightPriority) { // Could refactor to combine conditions
          return -1;
        } else if (rightPriority > leftPriority) {
          return 1;
        }
      });
  }, [balances, prices]); // 7. Should remove prices because it's value doesn't affect this function, this makes useMemo recalculates when prices changed

  const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
    return {
      ...balance,
      formatted: balance.amount.toFixed(),
    };
  });

  const rows = sortedBalances.map( // 8. balance type is FormattedWalletBalance so we expect to use formattedBalances instead of sortedBalances
    (balance: FormattedWalletBalance, index: number) => {
      const usdValue = prices[balance.currency] * balance.amount;
      return (
        <WalletRow
          className={classes.row} // 9. classes is not defined, assume this is passed from props
          key={index} // 10. Do not use index as key because it can cause performance issues and bugs when the list items are added, removed, or reordered
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={balance.formatted} // 11. We only use balance.formatted here so adding a for loop just to add formatted is not necessary 
          // => Should remove function formattedBalances and interface FormattedWalletBalance then add the value directly
        />
      );
    }
  );

  return <div {...rest}>{rows}</div>; // 12. Avoid spreading operator in passing props, only pass props that is needed is needed 
};
