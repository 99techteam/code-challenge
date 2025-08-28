interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string; // added missing property to use in priorityMap
}

//we can use a mapping object instead
const priorityMap: Record<string, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20
};

const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  // Memoized & corrected filtering + sorting
  const sortedBalances: WalletBalance[] = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        return !!priorityMap[balance.blockchain] && balance.amount > 0; // no need compare with -99, if it exists in priorityMap, it will return true
      })
      .sort((a: WalletBalance, b: WalletBalance) => {
        // we don't need to check for undefined values anymore because after filtering, all values are guaranteed to be present or empty array
        return priorityMap[b.blockchain] - priorityMap[a.blockchain];
      })
  }, [balances]);

  return (
    // The component to be flexible and accept arbitrary HTML attributes (like id, style, onClick, etc.)
    // Building a reusable or generic UI component
    <div {...rest}>
      {sortedBalances.map((balance: WalletBalance) => {
        const walletRowProps = {
          className: `wallet-row-${balance.blockchain.toLowerCase()}`, // we can define a className for each row based on blockchain or other properties
          key: balance.currency,
          amount: balance.amount,
          usdValue: (prices[balance.currency] ?? 0) * balance.amount, // prices[balance.currency] could be undefined
          formattedAmount: balance.amount.toFixed(),
        };
        return (
          <WalletRow {...walletRowProps}/>
        );
      })}
    </div>
  );
};