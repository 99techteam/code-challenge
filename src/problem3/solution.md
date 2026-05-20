## 1. Issue

The original `WalletPage` component had multiple logical and performance issues. The task required identifying these inefficiencies, explaining them clearly, and providing a corrected implementation.

The bug report in `issue.md` described a React + TypeScript functional component that used hooks and `useMemo`, but contained:

- incorrect filtering logic,
- wrong hook dependencies,
- unstable React list keys,
- type and data-shape mismatches,
- and redundant or broken code paths.

This document summarizes the issues and explains how the final `solution.tsx` resolves them.

---

## 2. Fixed Issues

### A. Critical Logic & Type Errors

1. **Undefined variable in filter condition**
   - Original: `lhsPriority` was referenced instead of `balancePriority`.
   - Fix: Use the correct variable and validate balance priority before keeping the item.

2. **Inverted filter criteria**
   - Original code kept balances with `amount <= 0`.
   - Fix: Keep only positive balances: `balance.amount > 0`.

3. **Missing `blockchain` field in `WalletBalance`**
   - Original type omitted `blockchain`, but code used it repeatedly.
   - Fix: Add `blockchain: string` to the `WalletBalance` interface.

4. **Dead and mismatched formatted data path**
   - Original code created `formattedBalances` but then rendered `sortedBalances` as if it already contained `formatted`.
   - Fix: Remove the broken data mismatch and render formatted output directly from the transformed balance list.

### B. Memoization and Performance Issues

5. **Incorrect `useMemo` dependency list**
   - Original: `sortedBalances` depended on `[balances, prices]` even though `prices` was not used in its callback.
   - Fix: Change dependency to `[balances]` only, preventing unnecessary recomputation when prices update.

6. **Unstable React keys**
   - Original: list items used `key={index}`, which is unsafe when list order changes.
   - Fix: Use a stable identifier combining blockchain and currency: `${balance.blockchain}-${balance.currency}`.

7. **Row memoization with correct dependencies**
   - Final implementation memoizes row generation and correctly depends on `sortedBalances` and `prices`.

### C. Code Quality and Readability

8. **Type safety improvement**
   - Original `getPriority` accepted `any`.
   - Fix: Extract priority mapping and use a typed lookup table outside the component.

9. **Simplified sort comparator**
   - Original comparator was verbose and did not handle equal priorities cleanly.
   - Fix: Use `return rightPriority - leftPriority` for descending order.

10. **Clear formatting intent**
    - Fix: Use explicit formatting when rendering amounts, making display values predictable.

---

## 3. Final Implementation Improvements

The corrected `solution.tsx` now includes:

- A complete `WalletBalance` interface with `currency`, `amount`, and `blockchain`.
- A reusable priority mapping helper (`BLOCKCHAIN_TOKENS`).
- A filtered and sorted balance list memoized by `balances` only.
- Stable list rendering keys.
- A self-contained row component with explicit props.
- Clear separation between data transformation and rendering.

## 7. Code Reference

Key code references are taken from `src/problem3/solution.tsx`.

### `WalletBalance` and priority lookup

```tsx
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}

const BLOCKCHAIN_TOKENS: Record<string, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

const getPriority = (blockchain: string): number =>
  BLOCKCHAIN_TOKENS[blockchain] || NO_TOKENS;
```

### Fixed filter and sort logic

```tsx
const sortedBalances = useMemo(() => {
  return balances
    .filter((balance: WalletBalance) => {
      const balancePriority = getPriority(balance.blockchain);
      return balancePriority > NO_TOKENS && balance.amount > 0;
    })
    .sort((lhs: WalletBalance, rhs: WalletBalance) => {
      const leftPriority = getPriority(lhs.blockchain);
      const rightPriority = getPriority(rhs.blockchain);
      return rightPriority - leftPriority;
    });
}, [balances]);
```

### Stable rendering and row memoization

```tsx
const rows = useMemo(() => {
  return sortedBalances.map((balance: WalletBalance) => {
    const usdValue = prices[balance.currency] * balance.amount;
    return (
      <WalletRow
        key={`${balance.blockchain}-${balance.currency}`}
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.amount.toFixed()}
      />
    );
  });
}, [sortedBalances, prices]);
```
