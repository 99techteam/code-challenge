# Problem 3: Messy React - Analysis and Refactoring

## 1. Computational Inefficiencies and Anti-Patterns Found

Below is a detailed analysis of the logic bugs, performance bottlenecks, and anti-patterns present in the original code block.

### A. Critical Logic Bugs
1. **Undefined Variable Reference (`lhsPriority`):** Inside the `filter` function, the variable `lhsPriority` is referenced (`if (lhsPriority > -99)`), but it is never defined. It should be `balancePriority`. This will cause a `ReferenceError` at runtime.
2. **Inverted Filter Logic:** The condition `if (balance.amount <= 0)` is highly suspicious for a wallet application. Typically, we want to render balances greater than zero. Keeping balances `<= 0` and returning `false` for others essentially hides all valid balances.
3. **Missing `return` in `sort` for Equal Priorities:** The `sort` callback handles `leftPriority > rightPriority` and vice versa, but it lacks a return value (implicitly returns `undefined`) when both priorities are exactly equal. This leads to inconsistent sorting behaviors across different browsers.
4. **Undefined CSS Classes Reference:** The `WalletRow` component uses `className={classes.row}`, but `classes` is never imported or defined in the file.
5. **Type Assertion Mismatch (Mapping error):** The `sortedBalances` array map tries to access `balance.formatted`, but `sortedBalances` is an array of `WalletBalance`, which does not have a `formatted` property. 

### B. Computational Inefficiencies (Performance)
1. **Wrong `useMemo` Dependencies:** The dependency array for `sortedBalances` includes `[balances, prices]`. However, the `prices` object is never used inside this `useMemo` block. This causes the expensive filter and sort operations to rerun unnecessarily every time `prices` change.
2. **Double Iteration / Unnecessary Mapping:** The code iterates over `sortedBalances` once to create `formattedBalances`, and then immediately iterates over `sortedBalances` *again* to create `rows`. This is redundant. Formatting can be done inline during the final mapping.
3. **Unstable Function Reference:** The `getPriority` function is defined inside the component. This means it is re-created on every single render. Since it doesn't rely on component state or props, it should be moved outside the component.

### C. Anti-patterns & Code Quality
1. **Array Index as React Key:** Using `key={index}` in the `rows` mapping is a major React anti-pattern. If the list order changes, React might reuse wrong DOM nodes, causing UI bugs. A unique identifier like `balance.currency` should be used instead.
2. **Using `any` Type:** The `getPriority` function accepts `blockchain: any`. This defeats the purpose of TypeScript. It should be explicitly typed as `string`.
3. **Unused Destructured Variable:** `children` is destructured from `props` but never used in the component.
4. **Incomplete Interface:** The `WalletBalance` interface lacks the `blockchain` property, yet `balance.blockchain` is accessed extensively.

---

## 2. Refactored Code

Here is the refactored version of the component. The logic has been consolidated, type safety improved, and performance optimized by reducing passes and fixing memoization dependencies.

```tsx
import React, { useMemo } from 'react';
import { BoxProps } from '@material-ui/core'; // Assuming BoxProps comes from here or similar

// 1. Fixed Interface: Added missing 'blockchain' property
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}

// 2. Used interface extension properly (removed empty interface Props extends BoxProps {})
type Props = BoxProps; 

// Mock hooks/components based on original code context
declare const useWalletBalances: () => WalletBalance[];
declare const usePrices: () => Record<string, number>;
declare const WalletRow: React.FC<any>;

// 3. Extracted getPriority out of the component to prevent re-creation on every render
// 4. Fixed 'any' type to 'string'
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

const WalletPage: React.FC<Props> = (props: Props) => {
  // 5. Removed unused 'children' destructuring
  const { ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const balancePriority = getPriority(balance.blockchain);
        // 6. Fixed 'lhsPriority' undefined bug
        // 7. Fixed inverted logic: Only keep valid blockchains and positive balances
        return balancePriority > -99 && balance.amount > 0;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        // 8. Simplified sort logic & fixed missing return 0 for equal cases
        return rightPriority - leftPriority; 
      });
  }, [balances]); // 9. Removed 'prices' from dependency array to prevent unnecessary re-renders

  // 10. Combined the formatting step into the rendering loop to avoid double iteration
  const rows = sortedBalances.map((balance: WalletBalance) => {
    const usdValue = (prices[balance.currency] || 0) * balance.amount;
    const formattedAmount = balance.amount.toFixed();

    return (
      <WalletRow 
        className="wallet-row" // 11. Fixed undefined classes.row
        key={balance.currency} // 12. Replaced anti-pattern 'index' key with unique identifier
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={formattedAmount} // 13. Fixed mapping error (balance.formatted was undefined)
      />
    );
  });

  return (
    <div {...rest}>
      {rows}
    </div>
  );
};

export default WalletPage;