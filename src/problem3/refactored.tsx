// REFACTORED CODE
// ================

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string; // Added missing property
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
  usdValue: number;
}

interface Props extends BoxProps {}

// Moved outside component to prevent recreation on every render
const getPriority = (blockchain: string): number => {
  switch (blockchain) {
    case 'Osmosis':
      return 100;
    case 'Ethereum':
      return 50;
    case 'Arbitrum':
      return 30;
    case 'Zilliqa':
    case 'Neo': // Combined duplicate values
      return 20;
    default:
      return -99;
  }
};

const WalletPage: React.FC<Props> = ({ children, ...rest }) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const balancePriority = getPriority(balance.blockchain);
        // Fixed: Keep only positive balances with valid priority
        return balancePriority > -99 && balance.amount > 0;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        // Simplified: use subtraction for complete sort logic
        return rightPriority - leftPriority;
      });
  }, [balances]); // Removed prices from dependencies

  // Combined formatting and row creation into single memoized operation
  const rows = useMemo(
    () =>
      sortedBalances.map((balance: WalletBalance) => {
        const usdValue = prices[balance.currency] * balance.amount;
        const formattedAmount = balance.amount.toFixed(2);

        return (
          <WalletRow
            className={classes.row}
            key={balance.currency} // Use unique identifier instead of index
            amount={balance.amount}
            usdValue={usdValue}
            formattedAmount={formattedAmount}
          />
        );
      }),
    [sortedBalances, prices] // Correct dependencies
  );

  return <div {...rest}>{rows}</div>;
};

export default WalletPage;
