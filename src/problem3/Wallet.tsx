interface WalletBalance {
  currency: string;
  amount: number;
}
interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
}

interface Props extends BoxProps { // BoxProps need to be defined details
  // should define children?: React.ReactNode;
}
const WalletPage: React.FC<Props> = (props: Props) => {  // Missing Export
 

  const { children, ...rest } = props; // missing define children Interface
  const balances = useWalletBalances(); // missing interface
  const prices = usePrices(); // missing interface

  const getPriority = (blockchain: any): number => { // should define blockchain type = string, change parameter name to blockchainName for understandability
    switch (blockchain) { // should define as a constant
      case "Osmosis": 
        return 100; 
      case "Ethereum":  
        return 50;  
      case "Arbitrum":
        return 30; 
      case "Zilliqa": 
        return 20; 
      case "Neo":  
        return 20; 
      default:
        return -99; 
  };
}

  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const balancePriority = getPriority(balance.blockchain); // define but not use 
        if (lhsPriority > -99) { // lhsPriority is not defined, should be balancePriority
          if (balance.amount <= 0) { // should be balance.amount > 0,  refactor this condition
            return true;
          }
        }
        return false;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        if (leftPriority > rightPriority) { // refactor this condition
          return -1;
        } else if (rightPriority > leftPriority) {
          return 1;
        }
      });
  }, [balances, prices]); // remove prices, it is not used in this function

  const formattedBalances = sortedBalances.map((balance: WalletBalance) => { // unused code, should merge logic to sortedBalances
    return {
      ...balance,
      formatted: balance.amount.toFixed(), // should define precision
    };
  });

  const rows = sortedBalances.map(
    (balance: FormattedWalletBalance, index: number) => {
      const usdValue = prices[balance.currency] * balance.amount;
      return (
        <WalletRow
          className={classes.row} //undefined classes properties
          key={index}
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={balance.formatted} // formatted undefined because formattedBalances is not used
        />
      );
    }
  );

  return <div {...rest}>{rows}</div>; // should be used exactly props to avoid mismatch props pass from the parent component
};
