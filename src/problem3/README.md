# Technical Report: Refactoring "Messy React" Component

## 1. Overview
This report analyzes the computational inefficiencies and anti-patterns found in the original `WalletPage` component and provides a production-ready refactored version.

## 2. Identified Issues & Inefficiencies

### A. Buggy Logic & Runtime Errors
*   **Undefined Variable:** The variable `lhsPriority` was used in the `filter` function without being defined. This would cause a `ReferenceError` at runtime.
*   **Incorrect Filter Logic:** The original code returned `true` for `amount <= 0`, which is counter-intuitive for a wallet display. Typically, we only want to show assets with a positive balance.

### B. Computational Inefficiencies
*   **Irrelevant Dependencies:** The `useMemo` hook included `prices` in its dependency array, even though `prices` was not used inside the memoized block. This causes unnecessary re-computations every time price data updates.
*   **Redundant Mapping:** The component mapped over the data twice—once to create `formattedBalances` and again to create `rows`. This increases memory usage and processing time.
*   **O(n) Priority Lookup:** Using a `switch-case` inside a `sort` and `filter` function leads to repeated branch evaluations.

### C. Anti-patterns
*   **Using Index as Key:** The use of `key={index}` for dynamic lists is a major anti-pattern in React. It can lead to rendering bugs and degraded performance during list re-ordering.
*   **Prop Drilling/Spreading:** Excessive use of `{...rest}` without explicit prop handling can make components harder to debug.

---

## 3. The Refactored Solution

The following code implements optimized data structures, improved type safety, and efficient rendering logic.

```tsx
import React, { useMemo } from 'react';

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}

const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = useUsePrices();

  // Optimized lookup with O(1) complexity
  const getPriority = (blockchain: string): number => {
    const priorities: Record<string, number> = {
      'Osmosis': 100,
      'Ethereum': 50,
      'Arbitrum': 30,
      'Zilliqa': 20,
      'Neo': 20,
    };
    return priorities[blockchain] ?? -99;
  };

  // Memoized sorted balances with correct dependencies
  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const priority = getPriority(balance.blockchain);
        return priority > -99 && balance.amount > 0;
      })
      .sort((lhs, rhs) => getPriority(rhs.blockchain) - getPriority(lhs.blockchain));
  }, [balances]);

  // Combined formatting and row generation to reduce iterations
  const rows = sortedBalances.map((balance) => {
    const usdValue = (prices[balance.currency] || 0) * balance.amount;
    
    return (
      <WalletRow // Stable amount="{balance.amount}" className="{classes.row}" formattedAmount="{balance.amount.toFixed(2)}" key unique usdValue="{usdValue}"/>
    );
  });

  return <div {...rest}>{rows}</div>;
};

export default WalletPage;
