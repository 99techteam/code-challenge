# WalletPage — Issues & Fixes

## Summary

This document captures the runtime, TypeScript, performance, and React anti-pattern issues found in the `WalletPage` implementation and provides concrete recommendations and minimal code suggestions to fix them.

---

## 1) Critical Logic & Runtime Errors

- **Undefined variable (`lhsPriority`)**

  - Problem: A non-existent variable is referenced inside the `.filter` callback. This will throw at runtime.

- **Inverted filter logic**

  - Problem: The filter currently returns `true` for `balance.amount <= 0`, which includes empty or negative wallets and excludes positive balances.

- **Property mismatch: missing `blockchain` on `WalletBalance`**

  - Problem: The code uses `balance.blockchain` but the type `WalletBalance` in the original code did not declare `blockchain`.
  - Fix: Add `blockchain: string` to `WalletBalance`.

- **Missing sort fallback**

  - Problem: The comparator does not explicitly return `0` when priorities are equal.

---

## 2) TypeScript & Type Safety Issues

- **Use of `any` in `getPriority`**

  - Problem: `getPriority(blockchain: any)` undermines type safety.

- **Redundant interfaces**

  - Problem: `FormattedWalletBalance` repeated `currency` and `amount`.

- **Interface mismatch when mapping**
  - Problem: Mapping `sortedBalances` (WalletBalance) as `FormattedWalletBalance` causes type errors because `formatted` doesn't exist yet.

---

## 3) Performance & Computational Issues

- **Inefficient `useMemo` dependencies**

  - Problem: Including `prices` in `useMemo` used for sorting causes re-sorts whenever prices update, even though prices don't affect order.

- **Double mapping**

  - Problem: First map to `formattedBalances`, then map again to create `rows` — two iterations.

- **Re-defining `getPriority` per render**
  - Problem: `getPriority` is declared inside the component body and re-created on each render.

---

## 4) React Best Practices & Anti-patterns

- **Unstable keys (using index)**

  - Problem: Using array index as `key` breaks reconciliation when the list reorders.
  - Fix: Use a stable composite key, e.g., `${balance.blockchain}-${balance.currency}`.

- **Missing precision control**

  - Problem: `balance.amount.toFixed()` with no argument rounds to integer.

- **Potentially undefined prices**
  - Problem: `prices[balance.currency]` may be `undefined`, resulting in `NaN` when multiplied.

## Fixes Applied

1. Logic & Runtime Fixes

- **Fixed Undefined Reference:** Replaced the non-existent `lhsPriority` with `balancePriority` to prevent runtime crashes.
- **Corrected Filter Logic:** Changed the inverted `amount <= 0` check to `amount > 0` so wallets with positive balances are shown.
- **Resolved Interface Mismatch:** Added `blockchain: string` to `WalletBalance` so `balance.blockchain` compiles correctly.

2. Performance Optimizations

- **Dependency Array Cleanup:** Removed `prices` from the `useMemo` dependency array used for sorting to avoid unnecessary re-sorts when prices change.
- **Loop Consolidation:** Eliminated the redundant `.map()`; formatting and rendering are done in a single pass.
- **Static Function Hoisting:** Moved `getPriority` outside the component to avoid re-allocating it on every render.

3. TypeScript & Type Safety

- **Eliminated `any`:** Changed the `blockchain` parameter type from `any` to `string` for better type safety.
- **Interface Extension:** Documented that `FormattedWalletBalance` should extend `WalletBalance` if used.
- **Accurate Mapping Type:** The final `.map()` uses `WalletBalance` and computes formatted values inline instead of pretending items already had a `formatted` field.

4. User Experience (UX) & Stability

- **Decimal Precision:** Added `.toFixed(6)` to preserve fractional amounts for crypto values.
- **Stable React Keys:** Replaced index keys with `${balance.blockchain}-${balance.currency}` for stable reconciliation.
- **NaN Prevention:** Used `(prices[balance.currency] || 0)` to avoid `NaN` when prices are missing.
