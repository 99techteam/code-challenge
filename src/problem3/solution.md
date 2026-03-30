# Problem 3 — Code Review & Refactoring

## Computational Inefficiencies and Anti-Patterns

### 1. Undefined Variable `lhsPriority` (Bug)
**Line 49:** `lhsPriority` is referenced but never declared. The computed value is stored in `balancePriority` (line 48) but never used.

**Fix:** Replace `lhsPriority` with `balancePriority`.

---

### 2. Wrong Filter Logic (Bug)
**Lines 50-51:** The filter returns `true` when `balance.amount <= 0`, which keeps wallets with zero or negative balances and removes positive ones.

**Fix:** Return `true` when `balance.amount > 0` to keep wallets with funds.

---

### 3. Missing `blockchain` Property on `WalletBalance` (Type Error)
**Line 48:** `balance.blockchain` is accessed, but the `WalletBalance` interface only defines `currency` and `amount`. TypeScript would flag this as an error.

**Fix:** Add `blockchain: string` to the `WalletBalance` interface.

---

### 4. `getPriority` Uses `any` Type (TypeScript Anti-pattern)
**Line 29:** `blockchain: any` completely bypasses TypeScript's type safety.

**Fix:** Use a string union type: `type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo'`.

---

### 5. `getPriority` Recreated on Every Render (Inefficiency)
**Lines 29-44:** The function is defined inside the component but has zero dependency on props or state. A new function instance is created on every render for no reason.

**Fix:** Move `getPriority` outside the component since it's a pure utility function.

---

### 6. `prices` in `useMemo` Dependency Array (Inefficiency)
**Line 64:** `prices` is listed as a dependency of `sortedBalances`, but `prices` is **never used** inside the `useMemo` callback.

**Fix:** Remove `prices` from the dependency array.

---

### 7. `formattedBalances` Computed But Never Used (Waste)
**Lines 66-71:** `formattedBalances` maps over `sortedBalances` to add a `formatted` field. But then `rows` (line 73) maps over `sortedBalances` again — not `formattedBalances`.

**Fix:** Use `formattedBalances` for the `rows` mapping, or combine both into a single pass.

---

### 8. Type Mismatch in `rows` Mapping (Type Error)
**Line 73:** The `.map()` callback types `balance` as `FormattedWalletBalance`, but `sortedBalances` contains `WalletBalance` objects (without the `formatted` property). Accessing `balance.formatted` would be `undefined` at runtime.

**Fix:** Map over `formattedBalances` instead, or merge the logic into one step.

---

### 9. Sort Comparator Doesn't Return `0` (Bug)
**Lines 58-62:** When `leftPriority === rightPriority`, the comparator returns `undefined` instead of `0`. This leads to **non-deterministic sort order** that varies across browser engines.

**Fix:** Return `0` for equal values, or simply use subtraction: `return rightPriority - leftPriority`.

---

### 10. Using Array Index as React `key` (Anti-pattern)
**Line 78:** `key={index}` causes incorrect DOM reconciliation when the list is reordered, filtered, or items are added/removed. This can result in stale UI or visual glitches.

**Fix:** Use a unique, stable identifier like `balance.currency`.

---

### 11. Empty `Props` Interface (Anti-pattern)
**Lines 21-23:** `interface Props extends BoxProps {}` adds no additional properties. This is unnecessary indirection.

**Fix:** Use `BoxProps` directly.

---

### 12. `children` Destructured But Never Used
**Line 25:** `children` is extracted from props but never rendered in the JSX output.

**Fix:** Either render `{children}` inside the component, or remove the destructuring.

---

### 13. `classes.row` Used Without Definition
**Line 77:** `classes.row` references a CSS modules / makeStyles object that is never defined or imported in the component scope.

**Fix:** Define the styles or import the stylesheet.

---

## Refactored Code

```tsx
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string; // [Fix #3] Added missing property
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

// [Fix #4] Use a union type instead of `any`
type Blockchain = "Osmosis" | "Ethereum" | "Arbitrum" | "Zilliqa" | "Neo";

// [Fix #5] Move outside component — no dependency on props/state
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

// [Fix #11] Use BoxProps directly instead of empty extending interface
const WalletPage: React.FC<BoxProps> = (props: BoxProps) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  // [Fix #6] Removed `prices` from dependency array — not used here
  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const balancePriority = getPriority(balance.blockchain);
        // [Fix #1] Use `balancePriority` (was `lhsPriority` — undefined)
        // [Fix #2] Invert logic — keep wallets with positive balance
        return balancePriority > -99 && balance.amount > 0;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        // [Fix #9] Subtraction always returns a number including 0
        return rightPriority - leftPriority;
      });
  }, [balances]);

  // [Fix #7 & #8] Combine formatting + row rendering in one pass
  // Memoize on both sortedBalances and prices (prices IS used here)
  const rows = useMemo(() => {
    return sortedBalances.map((balance: WalletBalance) => {
      const usdValue = prices[balance.currency] * balance.amount;
      return (
        <WalletRow
          className={classes.row}
          key={balance.currency} // [Fix #10] Stable unique key
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={balance.amount.toFixed(2)}
        />
      );
    });
  }, [sortedBalances, prices]);

  return (
    <div {...rest}>
      {rows}
    </div>
  );
};
```
