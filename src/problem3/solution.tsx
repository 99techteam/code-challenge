interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string; // Adding missing blockchain property
}
interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
}

interface Props extends BoxProps {}

// Create a priority map for blockchains
const PRIORITY_MAP: Record<string, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

	const getPriority = (blockchain: any): number => PRIORITY_MAP[blockchain] ?? -99;

  // Refactor sorting and filtering logic using useMemo
  const sortedBalances = useMemo(() => {
    return balances
      .filter(b => b.amount > 0 && getPriority(b.blockchain) > -99)
      .sort((a, b) => getPriority(b.blockchain) - getPriority(a.blockchain));
  }, [balances]);

  // Memoize formatted balances to avoid unnecessary recalculations
  const formattedBalances = useMemo(
    () =>
      sortedBalances.map(b => ({
        ...b,
        formatted: b.amount.toFixed(2)
      })),
    [sortedBalances]
  );

  // Using formattedBalances and prices to render rows
  const rows = formattedBalances.map(balance => {
    const usdValue = prices[balance.currency] * balance.amount;
    return (
      <WalletRow 
        className="wallet-row"
        key={balance.currency} // Use currency as a stable key
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.formatted}
      />
    )
  })

  return (
    <div {...rest}>
      {rows}
    </div>
  )
}