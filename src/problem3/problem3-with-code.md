# WalletPage Component - Code Review

## Computational Inefficiencies and Anti-Patterns Found

### Issue 1: Unnecessary Dependency in useMemo

**Problem:** The `prices` variable is included in the `useMemo` dependency array but is never used inside the callback. This causes unnecessary re-computation whenever prices change, leading to performance degradation.

**Solution:** Remove `prices` from the dependency array since it's not used.

### Issue 2: Undefined Variable Reference (Runtime Error)

**Problem:** The filter logic references `lhsPriority` which is undefined. This would cause a runtime error. The variable should be `balancePriority`.

**Solution:** Use the correct variable name `balancePriority`.

### Issue 3: Inverted Filter Logic

**Problem:** The filter returns `true` when `balance.amount <= 0`, which includes negative balances and excludes positive ones. This is inverted logic.

**Solution:** Change condition to `balance.amount > 0` to include only positive amounts.

### Issue 4: Redundant getPriority Calls

**Problem:** `getPriority()` is called twice per balance item - once in the filter and once in the sort. This results in O(2n) function calls instead of O(n).

**Solution:** Calculate priority once during filtering and pass it to sort, or compute priorities upfront.

### Issue 5: Unused Computed Variable

**Problem:** `formattedBalances` is computed but never used in the component, yet React still executes this code on every render.

**Solution:** Either use the computed value or wrap it in useMemo and remove if unused.

### Issue 6: Anti-Pattern - Using Array Index as Key

**Problem:** Using `index` as the `key` prop is an anti-pattern. Index changes when items are added, removed, or reordered, causing incorrect React reconciliation and performance issues.

**Solution:** Use a unique identifier like `currency` or a combination of `blockchain + currency`.

### Issue 7: Missing Null Safety for Price Lookup

**Problem:** The code accesses `prices[balance.currency]` without null safety, which could result in `NaN` if the price is undefined.

**Solution:** Use optional chaining or nullish coalescing: `prices[balance.currency] ?? 0`.

### Issue 8: Magic Numbers

**Problem:** Priority values like `-99`, `100`, `50` are magic numbers without descriptive names.

**Solution:** Extract to named constants with descriptive names.

### Issue 9: Using Switch Statement for Constant Lookups

**Problem:** The `getPriority` function uses a switch statement which has O(n) complexity for each lookup.

**Solution:** Use a `Record<string, number>` object for O(1) lookups.

### Issue 10: Unused Props Destructuring

**Problem:** `children` and `...rest` are destructured but never used. The component also extends `BoxProps` unnecessarily.

**Solution:** Only destructure what's needed.

### Issue 11: Undefined Variable `classes`

**Problem:** The code references `classes.row` which is never defined in the component scope.

**Solution:** Use `className` prop passed to the component instead.

### Issue 12: Type Safety - Using `any`

**Problem:** The original code uses `any` type for the blockchain parameter in `getPriority`.

**Solution:** Use `string` type for proper type safety.

---

## Summary of Improvements Made

1. Removed unused `prices` dependency from useMemo
2. Fixed undefined variable reference (`lhsPriority` → `balancePriority`)
3. Fixed inverted filter logic (`<= 0` → `> 0`)
4. Pre-compute priorities to avoid double getPriority calls (O(n) instead of O(2n))
5. Optimized getPriority with Record for O(1) lookups
6. Added proper useMemo for formatted balances
7. Changed key from index to currency
8. Added null safety for price lookups
9. Added type safety (no `any` types)
10. Fixed undefined `classes` reference
11. Simplified sort logic
12. Used named constants instead of magic numbers
13. Simplified props (removed unused children, rest)

---

## Refactored Code

```tsx
import React, { useMemo } from "react";

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

interface Props {
  className?: string;
}

interface WalletRowProps {
  className?: string;
  amount: number;
  usdValue: number;
  formattedAmount: string;
}

const useWalletBalances = (): WalletBalance[] => [];
const usePrices = (): Record<string, number> => ({});

const WalletRow: React.FC<WalletRowProps> = (_props: WalletRowProps) => {
  return null;
};

// These should be in constant.ts or something
// Issue 8 FIXED: Using named constants instead of magic numbers
const PRIORITY_DEFAULT = -99;
const PRIORITY_HIGH = 100;
const PRIORITY_MEDIUM = 50;
const PRIORITY_LOW = 30;
const PRIORITY_LOWER = 20;

// Issue 9 FIXED: Using Record for O(1) lookup instead of switch (O(n))
const BLOCKCHAIN_PRIORITY: Record<string, number> = {
  Osmosis: PRIORITY_HIGH,
  Ethereum: PRIORITY_MEDIUM,
  Arbitrum: PRIORITY_LOW,
  Zilliqa: PRIORITY_LOWER,
  Neo: PRIORITY_LOWER,
};

const getPriority = (blockchain: string): number => {
  // Issue 9 FIXED: Using Record for O(1) lookup
  // Issue 12 FIXED: Using 'string' type instead of 'any'
  return BLOCKCHAIN_PRIORITY[blockchain] ?? PRIORITY_DEFAULT;
};

// Issue 10 FIXED: Simplified props (removed unused children, rest)
// Issue 11 FIXED: Using passed className instead of undefined 'classes'
const WalletPage: React.FC<Props> = ({ className = "" }: Props) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  // Issue 1 FIXED: Removed unused 'prices' from dependency array
  // Issue 2 FIXED: Changed from undefined 'lhsPriority' to 'balancePriority'
  // Issue 3 FIXED: Changed condition from <= 0 to > 0 to include only positive amounts
  // Issue 4 FIXED: Pre-compute priorities during map to avoid double getPriority calls
  const sortedBalances = useMemo(() => {
    return balances
      .map((balance: WalletBalance) => ({
        balance,
        priority: getPriority(balance.blockchain),
      }))
      .filter(
        (item) => item.priority > PRIORITY_DEFAULT && item.balance.amount > 0,
      )
      .sort((a, b) => b.priority - a.priority)
      .map((item) => item.balance);
  }, [balances]);

  // Issue 5 FIXED: formattedBalances is now properly memoized and used
  const sortedBalancesWithFormatted = useMemo(() => {
    return sortedBalances.map((balance: WalletBalance) => ({
      ...balance,
      formatted: balance.amount.toFixed(),
    }));
  }, [sortedBalances]);

  const rows = sortedBalancesWithFormatted.map(
    (balance: FormattedWalletBalance) => {
      // Issue 7 FIXED: Added null safety with ?? operator for price lookup
      const usdValue = (prices[balance.currency] ?? 0) * balance.amount;
      return (
        <WalletRow
          className={className}
          // Issue 6 FIXED: Use unique identifier 'currency' instead of array index
          key={balance.currency}
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={balance.formatted}
        />
      );
    },
  );

  return <div className={className}>{rows}</div>;
};

export default WalletPage;
```
