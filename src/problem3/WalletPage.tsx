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
        if (lhsPriority > -99) { // 1. The variable lhsPriority does not exist. --> SOLUTION: Use balancePriority instead.
          if (balance.amount <= 0) { // 2. Filter out tokens with valid priority (ie > -99) and amount > 0 to display on UI. But in fact in the code it is "If priority is valid and amount ≤ 0 then keep" 
            return true;             // --> SOLUTION: Change to "If priority is valid and amount > 0 then keep"
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
      });
  }, [balances, prices]); // 3. The prices variable doesn't affect sortedBalances, but is still in the dependency, making the useMemo re-run redundant. --> SOLUTION: Remove prices from the dependency array.

  const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
    return {
      ...balance,
      formatted: balance.amount.toFixed(),
    };
  });

  const rows = sortedBalances.map( // 4. Here we don't use sortedBalances to map() but must use formattedBalances
    (balance: FormattedWalletBalance, index: number) => { 
      const usdValue = prices[balance.currency] * balance.amount; 
      return (
        <WalletRow
          className={classes.row}
          key={index} // 5. Using index as key in list can cause errors when list changes dynamically --> SOLUTION: Use balance.currency or unique ID as key.
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={balance.formatted}
        />
      );
    }
  );

  return <div {...rest}>{rows}</div>;
};
