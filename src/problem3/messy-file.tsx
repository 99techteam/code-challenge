interface WalletBalance {
  currency: string;
  amount: number;
}
interface FormattedWalletBalance {
  // can Extends WalletBalance
  currency: string;
  amount: number;
  formatted: string;
}

interface Props extends BoxProps {} // extend without adding new property
const WalletPage: React.FC<Props> = (props: Props) => {// component never export
  const { children, ...rest } = props; //missing classes destructure
  const balances = useWalletBalances(); // assuming a hook to get wallet balances but should mapped with the interface - handle error
  const prices = usePrices(); // assuming a hook to get prices - handel error

  const getPriority = (blockchain: any): number => { // use useCallback while using in another useMemo function or write outside component to avoid re create
    // should not use any type in typescript,
    switch (
      blockchain // return list of value can use object map (contain defined)
    ) {
      case "Osmosis": // define element as enum or constant
        return 100;
      case "Ethereum":
        return 50;
      case "Arbitrum":
        return 30;
      case "Zilliqa":
        return 20; // same value can merge case
      case "Neo":
        return 20;
      default:
        return -99;
    }
  };

  const sortedBalances = useMemo(() => {
    // can simplify the filter and sort logic and produce hook to reuse
    return balances
      .filter((balance: WalletBalance) => {
        const balancePriority = getPriority(balance.blockchain);// define but never use,  type blockchain not in WalletBalance
        if (lhsPriority > -99) {// wrong variable
          // can contain in one if use and condition then return to sorten code
          if (balance.amount <= 0) { // maybe wrong caclulation condition, negative amount is weird
            return true;
          }
        }
        return false;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => { // can contain sort direction to change the order
        //
        const leftPriority = getPriority(lhs.blockchain);// missing the type definition of blockchain in WalletBalance
        const rightPriority = getPriority(rhs.blockchain);//use many time for the get priority function
        if (leftPriority > rightPriority) {
          // can use return rightPriority - leftPriority to sort number directly
          return -1;
        } else if (rightPriority > leftPriority) {
          return 1;
        }
      }); // missing return 0;
  }, [balances, prices]); //get priority shouled be in dependency array, waite prices dependency

  const formattedBalances = sortedBalances.map((balance: WalletBalance) => {//can produce map at the same process with sortand filter,
    // function never use
    return {
      ...balance,
      formatted: balance.amount.toFixed(), //tofixed without parameter will return string with 0 decimal, should define the decimal point
    };
  });

  const rows = sortedBalances.map( // not cache and cause re render, if it contain many logic can create other component
    // use wrong list should use formattedBalances
    (balance: FormattedWalletBalance, index: number) => {
      //wrong type with the sortedBalances
      const usdValue = prices[balance.currency] * balance.amount; // can produce in map function and cache using use Memo - prices can be undefined risk
      return (
        <WalletRow
          className={classes.row}// classes not defined, it should be implement in props
          key={index}// not safe key for component list
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={balance.formatted} //formated not exist in sortedBalances
        />
      );
    }
  );

  return <div {...rest}>{rows}</div>;//  - empty state -
};
