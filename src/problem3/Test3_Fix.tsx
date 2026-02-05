interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}

// I assume BoxProps is imported from somewhere and it has class if not the WalletRow class.row will error
interface Props extends BoxProps {}

// move this function outside of the component to avoid re-creation on each render
const getPriority = (blockchain: string): number => {
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

const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const balancePriority = getPriority(balance.blockchain);
        // use balancePriority AND positive balance
        return balancePriority > -99 && balance.amount > 0;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        return getPriority(rhs.blockchain) - getPriority(lhs.blockchain);
      });
  }, [balances]); // Removed prices (only needed for USD calculation, not sorting)

  // Combined Map: Logic and UI generation in one go
  const rows = sortedBalances.map((balance: WalletBalance) => {
    const usdValue = (prices[balance.currency] || 0) * balance.amount; // Fallback to 0 if price not found to avoid NaN
    const formatted = balance.amount.toFixed(6); // Limit to 6 decimal points
    return (
      <WalletRow
        className={classes.row}
        key={`${balance.blockchain}-${balance.currency}`} // Stable unique key
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={formatted}
      />
    );
  });

  return <div {...rest}>{rows}</div>;
};
