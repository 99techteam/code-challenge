# WalletPage – Review & Refactor

This document explains the issues found in the original `WalletPage` implementation, and the refactoring applied to make it correct, type-safe, and efficient.

---

## Problems Found

### Types & Safety
- `WalletBalance` is missing `blockchain`, yet the code uses `balance.blockchain`.
- `getPriority(blockchain: any)` uses `any`, removing type guarantees.
- `Props extends BoxProps` but `BoxProps` is not imported; compilation will fail.
- `rows` maps `sortedBalances` but types its item as `FormattedWalletBalance` (mismatch).

### Logic Bugs
- `lhsPriority` referenced but undefined; should be `balancePriority`.
- Filter keeps balances with `amount <= 0` and drops positives (inverted condition).
- Sort comparator does not return `0` for equal priorities (not a total order).

### Performance / Render
- `sortedBalances` depends on `prices` but does not use it → unnecessary recompute on price ticks.
- `getPriority` called multiple times per element per comparison.
- `formattedBalances` is computed but never used.
- Keys use array index → unstable across reorders, causing re-mounts.

### UX / Robustness
- `toFixed()` without precision → always 0 decimals (unfriendly).
- `prices[balance.currency]` can be `undefined` → `NaN` USD values.
- `classes.row` referenced but not defined.
- `children` is destructured but not rendered.

---

## Refactoring

1. **Correctness**: fix filter and sort; remove undefined variables; handle missing prices.
2. **Type safety**: define a `Blockchain` union; give `WalletBalance` a `blockchain` field; remove `any`.
3. **Performance**: memorize with minimal deps; avoid duplicate `getPriority` calls; compute once.
4. **Stability**: use stable keys (`\`${blockchain}:${currency}\``).
5. **UX**: locale formatting with up to 6 fractional digits.

---