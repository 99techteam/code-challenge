import React, { useMemo } from "react";

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain; // Use the defined type
}

// Define a specific type for the blockchain
type Blockchain =
  | "Osmosis"
  | "Ethereum"
  | "Arbitrum"
  | "Zilliqa"
  | "Neo"
  | "Other";

// Define the priority function outside the component
const getPriority = (blockchain: Blockchain): number => {
  switch (blockchain) {
    case "Osmosis":
      return 100;
    case "Ethereum":
      return 50;
    case "Arbitrum":
      return 30;
    case "Zilliqa":
    case "Neo":
      return 20;
    default:
      return -99;
  }
};

type WalletPageProps = {
  // Simplified props (removed BoxProps)
  children?: React.ReactNode;
};

const WalletPage: React.FC<WalletPageProps> = ({ children }) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  // Separate filtering and sorting for clarity and efficiency
  const filteredBalances = useMemo(() => {
    return balances.filter((balance: WalletBalance) => {
      const balancePriority = getPriority(balance.blockchain);
      // Corrected filter condition
      return balancePriority > -99 && balance.amount > 0;
    });
  }, [balances]);

  const sortedBalances = useMemo(() => {
    // Sort a *copy* of the filtered balances, to avoid mutating the original
    return [...filteredBalances].sort(
      (lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        if (leftPriority > rightPriority) {
          return -1;
        } else if (rightPriority > leftPriority) {
          return 1;
        } else {
          return 0; // Ensure stable sort
        }
      }
    );
  }, [filteredBalances]);

  const rows = sortedBalances.map((balance: WalletBalance) => {
    const usdValue = prices[balance.currency] * balance.amount;
    return (
      <WalletRow
        //className={classes.row} // Assuming classes.row is defined elsewhere
        key={balance.currency} // Use a unique and stable key
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.amount.toFixed()} // Format directly here
      />
    );
  });

  return <div>{rows}</div>;
};

export default WalletPage;
