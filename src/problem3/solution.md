```jsx
// Fixed: Added missing blockchain property
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
  usdValue: number;
}

// Fixed: Added proper type for blockchain
type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo';

// Fixed: Extracted and memoized priority mapping
const BLOCKCHAIN_PRIORITIES: Record<Blockchain, number> = {
  'Osmosis': 100,
  'Ethereum': 50,
  'Arbitrum': 30,
  'Zilliqa': 20,
  'Neo': 20,
} as const;

// Fixed: Moved getPriority outside component as pure utility function
const getPriority = (blockchain: string): number => {
  return BLOCKCHAIN_PRIORITIES[blockchain as Blockchain] ?? -99;
};

// Custom hook to encapsulate wallet logic
const useFormattedWalletBalances = () => {
  const balances = useWalletBalances();
  const prices = usePrices();

  // Sort and filter balances
  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const priority = getPriority(balance.blockchain);
        return priority > -99 && balance.amount > 0;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        return rightPriority - leftPriority;
      });
  }, [balances]);

  // Format balances with USD values
  const formattedBalances = useMemo(() => {
    return sortedBalances.map((balance: WalletBalance) => {
      const price = prices[balance.currency] ?? 0;
      const usdValue = price * balance.amount;
      
      return {
        ...balance,
        formatted: balance.amount.toFixed(2), // Fixed: Added precision to prevent loss of decimals
        usdValue,
      };
    });
  }, [sortedBalances, prices]);

  return formattedBalances;
};

const WalletPage: React.FC<BoxProps> = (props) => {
  const formattedBalances = useFormattedWalletBalances();

  return (
    <div {...props}>
      {formattedBalances.map((balance) => (
        <WalletRow
          className={classes.row}
          key={`${balance.blockchain}-${balance.currency}`}
          amount={balance.amount}
          usdValue={balance.usdValue}
          formattedAmount={balance.formatted}
        />
      ))}
    </div>
  );
};
```