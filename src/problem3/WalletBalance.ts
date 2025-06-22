//1. Replaced key={index} with key={balance.id}
//Using array index as a React key is an anti-pattern, especially when items may be added, removed, or reordered. It causes unnecessary re-renders or incorrect component reuse.

//2. Extracted getPriority() function outside the component
//Defining functions inside the component causes a new instance of the function to be created on every render, which affects performance and breaks memoization.

//3. Created and used a BLOCKCHAIN_PRIORITIES map
//Using a switch statement for mapping values can become verbose and less maintainable. Using a dictionary-style object improves readability and extensibility.

//4. Separated useMemo blocks for filtering/sorting and value formatting
//Separating concerns improves code clarity and ensures each useMemo block handles one responsibility — sorting balances vs computing formatted and USD values.

//5. Removed unused children prop
//children was destructured from props but never used in the render output. Keeping it would be misleading and introduce dead code.

//6. Ensured correct type safety with FormattedWalletBalance[]
//Previously, the map function didn’t ensure the object had formatted and usdValue properties, potentially leading to runtime type errors.

//7. Used optional chaining and fallback for missing price data
//prices[balance.currency] could be undefined if price data is missing. Using ?? 0 prevents NaN results in USD calculation.

//8. Imported and used classes.row properly
//Previously classes was used without being defined, which would throw a runtime error.

import classes from "...";

interface WalletBalance {
  id: string; // if it already has, or can create a unique ID, ex:uuidv4()
  currency: string;
  amount: number;
  blockchain: string;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
  usdValue: number;
}

interface WalletPageProps extends BoxProps {}

//3
const BLOCKCHAIN_PRIORITIES: Record<string, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
  default: -99,
};

//2
const getPriority = (blockchain: string): number => {
  return BLOCKCHAIN_PRIORITIES[blockchain] || BLOCKCHAIN_PRIORITIES.default;
};

const WalletPage: React.FC<WalletPageProps> = ({ ...rest }) => { //5
  const balances = useWalletBalances();
  const prices = usePrices();

  //4
  const sortedAndFilteredBalances: WalletBalance[] = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const priority = getPriority(balance.blockchain);
        return priority > -99 && balance.amount > 0;
      })
      .sort(
        (a: WalletBalance, b: WalletBalance) =>
          getPriority(b.blockchain) - getPriority(a.blockchain)
      );
  }, [balances]);

  const balancesWithValues: FormattedWalletBalance[] = useMemo(() => { //6
    return sortedAndFilteredBalances.map(
      ({ id, currency, amount, blockchain }) => {
        const formatted = amount.toFixed();
        const usdRate = prices[currency] ?? 0; //7
        const usdValue = usdRate * amount;

        return {
          id,
          currency,
          amount,
          blockchain,
          formatted,
          usdValue,
        };
      }
    );
  }, [sortedAndFilteredBalances, prices]);

  return (
    <div {...rest}>
      {balancesWithValues.map((balance: FormattedWalletBalance) => ( //6
        <WalletRow
          className={classes.row} //8
          key={balance.id} //1
          amount={balance.amount}
          usdValue={balance.usdValue}
          formattedAmount={balance.formatted}
        />
      ))}
    </div>
  );
};
