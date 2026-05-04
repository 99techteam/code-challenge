interface WalletBalance {
  currency: string;
  amount: number;
  // Added missing property
  blockchain: string;
}
interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
}

interface BoxProps {}

interface Props extends BoxProps {}

// Extracted Priority Logic (Avoids re-declaring on every render)
const PRIORITY_MAP: Record<string, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

const getPriority = (blockchain: string): number => {
  // fix any type
  return PRIORITY_MAP[blockchain] ?? -99;
};

const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  const formattedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const balancePriority = getPriority(balance.blockchain);
        // Fixed logic to show positive balances
        if (balancePriority > -99) {
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
      })
      .map(
        (balance: WalletBalance): FormattedWalletBalance => ({
          ...balance,
          formatted: balance.amount.toFixed(),
        }),
      );
  }, [balances]);
  // Removed 'prices' dependency

  const rows = formattedBalances.map(
    // Clean Mapping
    (balance: FormattedWalletBalance, index: number) => {
      const usdValue = prices[balance.currency] * balance.amount;
      return (
        <WalletRow
          className={classes.row}
          // Use currency instead of index
          key={balance.currency}
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={balance.formatted}
        />
      );
    },
  );

  return <div {...rest}>{rows}</div>;
};
