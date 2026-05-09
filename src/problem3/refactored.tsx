// REFACTORED CODE
// ================

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string; // Added missing property
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
        // Fixed: Keep only positive balances with valid priority
        return getPriority(balance.blockchain) > -99 && balance.amount > 0;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        // Schwartzian transform: compute priority once per element
        return getPriority(rhs.blockchain) - getPriority(lhs.blockchain);
      });
  }, [balances]);

  // Combined formatting and row creation into single memoized operation
  const rows = useMemo(
    () =>
      sortedBalances.map((balance: WalletBalance) => {
        const usdValue = (prices[balance.currency] ?? 0) * balance.amount; // Guard against undefined price
        const formattedAmount = balance.amount.toFixed(2);

        return (
          <WalletRow
            className={classes.row}
            key={`${balance.blockchain}-${balance.currency}`} // Unique across blockchain+currency
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
