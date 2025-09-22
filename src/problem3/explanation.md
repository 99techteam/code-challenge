# WalletPage Component – Code Review & Refactor

This document highlights the **computational inefficiencies** and **anti-patterns** found in the original `WalletPage` component and provides a refactored version with explanations.

---

## 🚩 Issues Found

1. **Missing property in interface**
   - `WalletBalance` interface did not define `blockchain`, but it was used in `getPriority`.

2. **Inefficient `getPriority` implementation**
   - Defined inside the component, recreated on every render.
   - Relied on a verbose `switch` with magic numbers.
   - Used `any` type instead of `string`.

3. **Broken filter logic**
   - Used an undefined variable `lhsPriority`.
   - Allowed balances with `amount <= 0` instead of discarding them.
   - Mixed filtering and priority logic in an unclear way.

4. **Sorting comparator**
   - Verbose `if/else` chain instead of a simple numeric comparison.

5. **Redundant computations**
   - Iterated over balances multiple times (`sortedBalances`, then `formattedBalances`, then `rows`).
   - `prices` included in `useMemo` dependency but never used.

6. **Formatting issue**
   - `toFixed()` without precision argument returns integer strings, potentially misrepresenting values.

7. **Unstable React keys**
   - Used `index` as list key, which breaks reconciliation when items reorder.

8. **Undefined styling**
   - `className={classes.row}` referenced `classes` which was never defined.

9. **Excessive prop spreading**
   - `{...rest}` passed all props blindly to `<div>`, risking invalid DOM attributes.

---

## 🔑 Key Improvements

- **Add missing `blockchain` property** to the `WalletBalance` interface.  
- **Replace `switch` with `PRIORITY_MAP`** for cleaner and faster priority lookup.  
- **Refactor `sortedBalances`** to remove the redundant `prices` dependency.  
- **Memoize `formattedBalances`** to avoid unnecessary recalculations.  
- **Generate rows from `formattedBalances`** instead of `sortedBalances`.  
- **Use `currency` as a stable React key** (`key={balance.currency}`) instead of index.  
- **Remove `classes.row`** since it was never defined.  
- **Restrict prop spreading** to avoid leaking invalid attributes to the DOM.  

---