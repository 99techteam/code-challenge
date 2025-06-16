/* Shoud add optional chaining or fallback (?. or || 0) to validate data */
/* Shoud use lodash to find, filter... */

interface WalletBalance {
  currency: string;
  amount: number;
  /* missing blockchain: string */
}

/* FormattedWalletBalance should extend WalletBalance */
interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
}

/* missing interface BoxProps, should use BoxProps comes from Material-UI ? */
interface Props extends BoxProps {}

const WalletPage: React.FC<Props> = ({ children, ...rest }) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  /* blockchain: any defeats the purpose of using TypeScript, use string instead  */
  const getPriority = (blockchain: any): number => {
    /* shoud define type BlockChain */
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
        /* balancePriority but not use */
        const balancePriority = getPriority(balance.blockchain);
        /* lhsPriority is not defined, should use balancePriority */
        /* messy if condition, getPriority call many time in sort and filter loop */
        if (lhsPriority > -99) {
          if (balance.amount <= 0) {
            return true;
          }
        }
        return false;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        /* messy if condition */
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        if (leftPriority > rightPriority) {
          return -1;
        } else if (rightPriority > leftPriority) {
          return 1;
        }
      });
    /* not use prices */
  }, [balances, prices]);

  /* formattedBalances defined but not use */
  const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
    return {
      ...balance,
      formatted: balance.amount.toFixed(),
    };
  });

  const rows = sortedBalances.map(
    (balance: FormattedWalletBalance, index: number) => {
      const usdValue = prices[balance.currency] * balance.amount;
      return (
        <WalletRow
          /* missing classes */
          className={classes.row}
          /* Using index as key can cause unnecessary re-renders if list changes, should use balance.currency */
          key={index}
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={balance.formatted}
        />
      );
    }
  );

  /* should render childern ? */
  return <div {...rest}>{rows}</div>;
};
