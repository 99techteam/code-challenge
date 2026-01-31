import React, { useMemo } from "react";

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

interface Props extends BoxProps {}

type Blockchain = "Osmosis" | "Ethereum" | "Arbitrum" | "Zilliqa" | "Neo";

// Constants defined outside component
const BLOCKCHAIN_PRIORITIES: Record<string, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
} as const;

// Pure function defined outside component - won't be recreated on each render
const getPriority = (blockchain: string): number => {
  return BLOCKCHAIN_PRIORITIES[blockchain as Blockchain] ?? -99;
};

const WalletPage: React.FC<Props> = ({ ...rest }) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const balancePriority = getPriority(balance.blockchain);
        // Fixed: Changed variable name and inverted logic
        // Keep only balances with priority > -99 AND amount > 0
        return balancePriority > -99 && balance.amount > 0;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        // Simplified: Use subtraction for descending sort
        // Fix: Return 0 when equal (was returning undefined)
        return rightPriority - leftPriority;
      })
      .map(
        (balance: WalletBalance): FormattedWalletBalance => ({
          ...balance,
          formatted: balance.amount.toFixed(3),
        }),
      );
  }, [balances]); // Removed 'prices' because it is not used in this computation

  const rows = useMemo(() => {
    return sortedBalances.map((balance: FormattedWalletBalance) => {
      const usdValue = (prices[balance.currency] ?? 0) * balance.amount;

      return (
        <WalletRow
          // Use currency as key (assuming it's unique per wallet)
          // If not unique, consider: `${balance.blockchain}-${balance.currency}`
          key={balance.currency}
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={balance.formatted}
        />
      );
    });
  }, [sortedBalances, prices]); // Both dependencies are actually used now

  return <div {...rest}>{rows}</div>;
};

export default WalletPage;

/*
Problem Summary

Critical bugs
1. Undefined Variable: lhsPriority doesn't exist (should be balancePriority)
2. Inverted Filter Logic : Return balances with amount <= 0, should filter out.
3. Missing return in sort: When priorties are equal, returns "undefined" instead of "0"
4. Type misMatch: rows maps over sortedBalances but types it as "FormattedWalletBalance"

Anti-Pattern
1. Array index as key: Using index as React key causes rendering issues when list changes
2. Wrong useMemo dependencies: prices included but not used in the memoized computation
3. Unused computed value: formattedBalances calculated but never used.
4.  Unused destructured variable: children destructured but not referenced

TypeScript Issues
1. Missing interface property: blockchain not defined in WalletBalance
2. any type: blockchain parameter should be typed(eg., enum or string)
3. Type annotation redundance: Explicit props:Props when using React.FC<Props>
4. Undefined reference: classes object not imported/defined

Performance Issues
1. Function recreated on every render: getPriority should be outside component or memoized
2. Multiple calls to getPriorityL Called 3+ times per balance during filter/sort
3. Double iteration: Two separate map operations when one would suffice

*/
