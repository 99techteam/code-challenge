# WalletPage Code Review

## Overview

This document covers a code review of the `WalletPage` React component. The original code contained a mix of outright bugs, logic mistakes, TypeScript gaps, and performance inefficiencies. Each issue is described below alongside the reasoning behind the fix.

---

## Issues and Solutions

### 1. Reference to an Undefined Variable

The filter function computed a variable called `balancePriority` but then checked a completely different name, `lhsPriority`, which was never declared anywhere in scope. This would throw a `ReferenceError` at runtime the moment the component tried to render.

The fix is straightforward: use the variable that was actually declared. `balancePriority` should be what gets checked against `-99`.

---

### 2. Inverted Filter Logic

Even after fixing the variable name, the filter condition itself was backwards. The intent was to keep balances with a positive amount, but the condition `balance.amount <= 0` does the opposite — it keeps zeroes and negatives, discarding everything valid.

The corrected condition is `balance.amount > 0`, which keeps only balances that actually hold value.

---

### 3. `getPriority` Recreated on Every Render

`getPriority` is a pure function — it takes a blockchain name and returns a fixed number. It has no dependency on props, state, or anything inside the component. Despite this, it was declared inside the component body, which means JavaScript creates a brand new function object on every render.

The right move is to pull it out of the component entirely. A module-level function is created once and reused forever.

---

### 4. `blockchain` Typed as `any`

The `getPriority` parameter was typed as `any`, which turns off TypeScript's type checking for that argument. If someone passed a number or an object by mistake, TypeScript would say nothing.

A union type covering the known blockchain names, with a fallback of `string` for unknown ones, gives the compiler enough information to catch mistakes without being overly restrictive.

---

### 5. `prices` Listed as a Dependency but Never Used

The `useMemo` that computes `sortedBalances` listed `prices` in its dependency array, but `prices` was not referenced anywhere inside that memo. This means the sorted list got recomputed every time prices changed — which in a live pricing feed could be very frequent — for absolutely no reason.

Once `usdValue` computation was moved into the memo (see issue 9), `prices` becomes a legitimate dependency. Until that point, it should simply be removed from the array.

---

### 6. `formattedBalances` Is Computed but Never Used

The code mapped `sortedBalances` into a `formattedBalances` array, then never used it. The `rows` variable mapped over `sortedBalances` directly instead, meaning `formattedBalances` was dead code that wasted time and memory on every render.

The solution is to eliminate the separate step and fold formatting directly into the main `useMemo`, producing a single pipeline that filters, sorts, and formats in one pass.

---

### 7. `blockchain` Missing from the `WalletBalance` Interface

The `WalletBalance` interface declared `currency` and `amount` but omitted `blockchain`, even though `blockchain` was accessed throughout the component. TypeScript had no knowledge of this field, so it could not catch any mistakes around it.

Adding `blockchain` to the interface closes that gap.

---

### 8. Array Index Used as `key`

React uses the `key` prop to track which list items changed between renders. Using the array index as a key works only when the list never changes order. Since this list is actively sorted and filtered, indices shift constantly, causing React to misidentify which rows changed. This leads to incorrect reconciliation, potential UI glitches, and stale state in child components.

Using `balance.currency` as the key gives each row a stable, unique identity that survives reordering.

---

### 9. Sort Comparator Had No Return for the Equal Case

The comparator handled the cases where left priority was greater and where right priority was greater, but fell through with an implicit `undefined` when the two were equal. The sort contract requires returning `0` for equal elements; returning `undefined` is undefined behavior.

Replacing the if-else chain with a simple subtraction — `getPriority(rhs.blockchain) - getPriority(lhs.blockchain)` — covers all three cases in one line.

---

### 10. `children` Destructured but Not Rendered

`children` was pulled out of props and then silently dropped. The component returned a `div` with only the wallet rows inside, discarding whatever the parent had passed as children. This is either a bug or unnecessary destructuring.

The fix is to render `{children}` inside the returned `div`.

---

## Performance-Specific Improvements

Beyond the correctness fixes above, three additional changes improve runtime performance.

**Pre-computing priorities before sorting.** The original sort called `getPriority` inside the comparator, meaning it was called repeatedly as the sort algorithm ran — O(N log N) calls total. The fix maps over the array once to attach a `priority` field to each item before sorting, reducing getPriority calls to O(N).

**Memoizing the rows array.** The `rows` variable was a `.map()` over the formatted balances that ran on every render regardless of whether the underlying data had changed. Wrapping it in `useMemo` with `sortedAndFormattedBalances` as a dependency means the JSX is only rebuilt when the data actually changes.

**Moving `usdValue` computation out of the render phase.** The USD value for each balance was calculated inline during the map that produced JSX. This belongs in the data transformation memo instead, keeping the render phase lightweight and the data logic consolidated in one place.

---

## Final Shape of the Solution

After all fixes, the component follows a clean pipeline:

The raw balances go through a single `useMemo` that maps priorities, filters out low-priority and zero-amount entries, sorts by priority descending, then formats amounts and computes USD values. The result feeds directly into a second `useMemo` that produces the row JSX. The component's return statement is then just a thin shell that places children and rows inside a div.

```tsx
import React, { useMemo } from 'react';

type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo';

interface WalletBalance {
  blockchain: Blockchain | string;
  currency: string;
  amount: number;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
  usdValue: number;
}

interface Props extends BoxProps {}

const getPriority = (blockchain: Blockchain | string): number => {
  switch (blockchain) {
    case 'Osmosis':  return 100;
    case 'Ethereum': return 50;
    case 'Arbitrum': return 30;
    case 'Zilliqa':  return 20;
    case 'Neo':      return 20;
    default:         return -99;
  }
};

const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  const sortedAndFormattedBalances = useMemo((): FormattedWalletBalance[] => {
    return balances
      .map((balance: WalletBalance) => ({
        balance,
        priority: getPriority(balance.blockchain),
      }))
      .filter(({ priority, balance }) => priority > -99 && balance.amount > 0)
      .sort((lhs, rhs) => rhs.priority - lhs.priority)
      .map(({ balance }): FormattedWalletBalance => ({
        ...balance,
        formatted: balance.amount.toFixed(),
        usdValue: prices[balance.currency] * balance.amount,
      }));
  }, [balances, prices]);

  const rows = useMemo(() => {
    return sortedAndFormattedBalances.map((balance: FormattedWalletBalance) => (
      <WalletRow
        className={classes.row}
        key={balance.currency}
        amount={balance.amount}
        usdValue={balance.usdValue}
        formattedAmount={balance.formatted}
      />
    ));
  }, [sortedAndFormattedBalances]);

  return (
    <div {...rest}>
      {children}
      {rows}
    </div>
  );
};

export default React.memo(WalletPage);
```