// ISSUE #13: Missing all necessary imports at the top of the file
// Should import: React, { useMemo } from 'react'
// Should import: BoxProps (likely from '@mui/material' or similar)
// Should import: useWalletBalances, usePrices hooks
// Should import: WalletRow component
// Should import or define: classes object

// ISSUE #5: Missing 'blockchain' property in WalletBalance interface
// This interface should include blockchain: string
interface WalletBalance {
  currency: string;
  amount: number;
}
interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
}

interface Props extends BoxProps {}
const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  const getPriority = (blockchain: any): number => {
    switch (blockchain) {
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
    }
  };

  // ISSUE #4: 'prices' is in the dependency array but never used in this useMemo
  // This causes unnecessary recalculations when prices change
  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        // ISSUE #5: balance.blockchain doesn't exist on WalletBalance type
        const balancePriority = getPriority(balance.blockchain);
        // ISSUE #1: 'lhsPriority' is undefined - should be 'balancePriority'
        // ISSUE #3: Should check 'balancePriority > -99' instead
        if (lhsPriority > -99) {
          // ISSUE #2: Inverted logic - this keeps balances with amount <= 0
          // Should be 'balance.amount > 0' to keep positive balances
          if (balance.amount <= 0) {
            return true;
          }
        }
        return false;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        // ISSUE #7: getPriority is called multiple times for the same balance
        // during sorting - could cache these values for O(n log n) improvement
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        if (leftPriority > rightPriority) {
          return -1;
        } else if (rightPriority > leftPriority) {
          return 1;
        }
        // ISSUE #10: Missing return statement when priorities are equal
        // Should return 0 here, currently returns undefined causing unpredictable sorting
      });
  }, [balances, prices]);

  // ISSUE #6: This computed value is never used - wasted computation
  // ISSUE #11: Unnecessary spread operator copies all properties
  // ISSUE #12: Not memoized, recalculates on every render
  const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
    return {
      ...balance,
      formatted: balance.amount.toFixed(),
    };
  });

  // ISSUE #6: Mapping over sortedBalances again instead of using formattedBalances
  // This creates double iteration and redundant work
  // ISSUE #12: Not memoized, recalculates on every render
  const rows = sortedBalances.map(
    // ISSUE #9: Type mismatch - sortedBalances contains WalletBalance but typed as FormattedWalletBalance
    (balance: FormattedWalletBalance, index: number) => {
      const usdValue = prices[balance.currency] * balance.amount;
      return (
        <WalletRow
          className={classes.row}
          // ISSUE #8: Using index as key is an anti-pattern
          // Should use unique identifier like balance.currency
          key={index}
          amount={balance.amount}
          usdValue={usdValue}
          // ISSUE #9: balance.formatted doesn't exist because we're mapping sortedBalances, not formattedBalances
          formattedAmount={balance.formatted}
        />
      );
    },
  );

  return <div {...rest}>{rows}</div>;
};
