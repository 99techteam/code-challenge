interface WalletBalance {
    blockchain: string;
    currency: string;
    amount: number;
  }
  
interface Props extends BoxProps {}
  
const WalletPage: React.FC<Props> = ({ children, ...rest }) => {
    const balances = useWalletBalances();
    const prices = usePrices();
  
    const getPriority = (blockchain: string): number => {
      switch (blockchain) {
        case 'Osmosis': return 100;
        case 'Ethereum': return 50;
        case 'Arbitrum': return 30;
        case 'Zilliqa': return 20;
        case 'Neo': return 20;
        default: return -99;
      }
    };
  
    const sortedBalances = useMemo(() => {
      return balances
        .map(balance => ({
          ...balance,
          priority: getPriority(balance.blockchain)
        }))
        .filter(balance => balance.priority > -99 && balance.amount > 0)
        .sort((a, b) => b.priority - a.priority);
    }, [balances]);
  
    const rows = sortedBalances.map((balance) => {
      const formattedAmount = balance.amount.toFixed();
      const usdValue = prices[balance.currency] * balance.amount;
      return (
        <WalletRow
          className={classes.row}
          key={`${balance.blockchain}-${balance.currency}`}
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={formattedAmount}
        />
      );
    });
  
    return <div {...rest}>{rows}</div>;
};