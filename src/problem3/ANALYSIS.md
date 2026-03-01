# Problem 3: Messy React — Analysis & Refactor

## Original code (for reference)

```tsx
interface WalletBalance {
  currency: string;
  amount: number;
}
interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
}

interface Props extends BoxProps {}

const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  const getPriority = (blockchain: any): number => {
    switch (blockchain) {
      case 'Osmosis':    return 100;
      case 'Ethereum':   return 50;
      case 'Arbitrum':   return 30;
      case 'Zilliqa':    return 20;
      case 'Neo':        return 20;
      default:           return -99;
    }
  };

  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const balancePriority = getPriority(balance.blockchain);
        if (lhsPriority > -99) {
          if (balance.amount <= 0) {
            return true;
          }
        }
        return false;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        if (leftPriority > rightPriority) {
          return -1;
        } else if (rightPriority > leftPriority) {
          return 1;
        }
      });
  }, [balances, prices]);

  const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
    return {
      ...balance,
      formatted: balance.amount.toFixed(),
    };
  });

  const rows = sortedBalances.map(
    (balance: FormattedWalletBalance, index: number) => {
      const usdValue = prices[balance.currency] * balance.amount;
      return (
        <WalletRow
          className={classes.row}
          key={index}
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={balance.formatted}
        />
      );
    }
  );

  return <div {...rest}>{rows}</div>;
};
```

---

## 1. Computational inefficiencies & anti-patterns

### Issue 1 — Bug: `lhsPriority` is not defined (should be `balancePriority`)

**Location:** `filter` callback

```tsx
const balancePriority = getPriority(balance.blockchain);
if (lhsPriority > -99) {   // ← lhsPriority is never declared in this scope
```

**Impact:** `lhsPriority` is `undefined`. The expression `undefined > -99` evaluates to `false`, so the condition **never** passes. The filter returns `false` for every element → the resulting array is **always empty**.

**Fix:** Replace `lhsPriority` with `balancePriority`.

---

### Issue 2 — Bug: Filter logic is inverted

**Location:** `filter` callback (inner condition)

```tsx
if (balancePriority > -99) {
  if (balance.amount <= 0) {   // ← keeps zero/negative balances
    return true;
  }
}
return false;
```

**Impact:** Even after fixing Issue 1, this keeps balances where `amount ≤ 0` (empty/negative wallets) and **discards** positive balances — the exact opposite of what a wallet page should show.

**Fix:** The condition should be `balance.amount > 0`, or simplify to:

```tsx
return balancePriority > -99 && balance.amount > 0;
```

---

### Issue 3 — Type error: `blockchain` missing from `WalletBalance`

**Location:** Interface definition + usage

```tsx
interface WalletBalance {
  currency: string;
  amount: number;
  // ← no 'blockchain' property
}
// ...
getPriority(balance.blockchain);  // ← TypeScript error: Property 'blockchain' does not exist
```

**Impact:** TypeScript will flag this as a compile-time error. At runtime the property would be `undefined`, making `getPriority` always return `-99`.

**Fix:** Add `blockchain: string` (or a union type) to `WalletBalance`.

---

### Issue 4 — Bug: Sort comparator does not return `0` for equal case

**Location:** `.sort()` callback

```tsx
if (leftPriority > rightPriority) {
  return -1;
} else if (rightPriority > leftPriority) {
  return 1;
}
// ← implicitly returns undefined when leftPriority === rightPriority
```

**Impact:** Per the ECMAScript spec, a comparator that returns `undefined` (non-numeric) leads to **implementation-defined** sort behavior. The sort may be unstable or produce inconsistent orderings.

**Fix:** Use arithmetic subtraction which naturally handles all three cases:

```tsx
return rightPriority - leftPriority;
```

---

### Issue 5 — Performance: `prices` in `useMemo` dependency array but unused

**Location:** `useMemo` hook for `sortedBalances`

```tsx
}, [balances, prices]);  // ← prices is not used in the computation
```

**Impact:** Every time `prices` changes (which could be frequent in a real-time trading app), `sortedBalances` is recalculated even though the result depends only on `balances`. This is unnecessary work.

**Fix:** Remove `prices` from deps → `[balances]`.

---

### Issue 6 — Bug: `formattedBalances` computed but never used; rows read from wrong source

**Location:** Rows mapping

```tsx
const formattedBalances = sortedBalances.map(/* adds 'formatted' */);

const rows = sortedBalances.map((balance: FormattedWalletBalance, ...) => {
  //           ↑ uses sortedBalances, NOT formattedBalances
  // balance.formatted is undefined here since sortedBalances items are WalletBalance, not FormattedWalletBalance
});
```

**Impact:** Two problems:
1. `formattedBalances` is dead code — computed but never consumed.
2. `balance.formatted` is `undefined` because `sortedBalances` items don't have the `formatted` property. The `WalletRow` component receives `undefined` for `formattedAmount`.

**Fix:** Use `formattedBalances` (not `sortedBalances`) in the rows map. Better yet, compute everything in a single memoized chain.

---

### Issue 7 — Anti-pattern: Using array index as React `key`

**Location:** `rows` mapping

```tsx
key={index}
```

**Impact:** When the list is sorted or filtered, indices shift but React may reuse DOM nodes based on old keys. This causes:
- Stale state in child components
- Wrong animations
- Unnecessary re-renders

**Fix:** Use a stable, unique identifier:

```tsx
key={`${balance.blockchain}-${balance.currency}`}
```

---

### Issue 8 — Performance: `getPriority` recreated every render

**Location:** Inside component body

```tsx
const getPriority = (blockchain: any): number => { ... }
```

**Impact:** This creates a new function reference on every render. Since `getPriority` is a **pure function** with no dependency on component state or props, this is wasteful. If used in a `useMemo` or `useCallback` dependency array, it would cause unnecessary recomputation.

**Fix:** Move `getPriority` **outside** the component — it's a pure utility function.

---

### Issue 9 — Type safety: `blockchain: any`

**Location:** `getPriority` parameter

```tsx
const getPriority = (blockchain: any): number => { ... }
```

**Impact:** Using `any` defeats TypeScript's type checking. Typos like `'Etherium'` would silently fall through to the default case.

**Fix:** Type as a union or at minimum as `string`:

```tsx
type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo' | string;
```

---

### Issue 10 — Robustness: `prices[balance.currency]` may be `undefined`

**Location:** Rows mapping

```tsx
const usdValue = prices[balance.currency] * balance.amount;
```

**Impact:** If `prices` doesn't contain the currency key, the lookup returns `undefined`, and `undefined * number` is `NaN`. The UI would show `NaN`.

**Fix:** Provide a fallback:

```tsx
const usdValue = (prices[balance.currency] ?? 0) * balance.amount;
```

---

### Issue 11 — Style: Empty interface adds noise

**Location:** Props interface

```tsx
interface Props extends BoxProps {}
```

**Impact:** This adds nothing over `BoxProps`. It's unnecessary indirection.

**Fix:** Use `BoxProps` directly or only extend when adding additional props.

---

### Issue 12 — Logic: Destructured `children` is never rendered

**Location:** Component body

```tsx
const { children, ...rest } = props;
// children is never used in JSX
return <div {...rest}>{rows}</div>;
```

**Impact:** If a parent passes `children`, they're silently discarded. This is misleading API design.

**Fix:** Either render `children` in the JSX, or remove it from destructuring (let it stay in `rest`).

---

### Issue 13 — Missing definition: `classes.row`

**Location:** Rows mapping

```tsx
className={classes.row}
```

**Impact:** `classes` is not defined anywhere in the component. In a real app this would be a `ReferenceError` at runtime (or would come from a CSS-in-JS hook like `makeStyles` that's missing from the snippet).

**Fix:** Define `classes` via the styling system in use, or replace with a plain CSS class name / CSS module import.

---

## 2. Summary table

| # | Category | Issue | Severity |
|---|----------|-------|----------|
| 1 | Bug | `lhsPriority` undefined in filter | Critical |
| 2 | Bug | Filter keeps amount ≤ 0, drops > 0 | Critical |
| 3 | Type | `WalletBalance` missing `blockchain` | High |
| 4 | Bug | Sort comparator missing `return 0` | Medium |
| 5 | Performance | `prices` in useMemo deps (unused) | Medium |
| 6 | Bug | `formattedBalances` unused; rows use raw data | High |
| 7 | Anti-pattern | `key={index}` on filtered/sorted list | Medium |
| 8 | Performance | `getPriority` recreated every render | Low |
| 9 | Type | `blockchain: any` | Low |
| 10 | Robustness | `prices[currency]` can be `undefined` → `NaN` | Medium |
| 11 | Style | Empty `Props` interface | Low |
| 12 | Logic | `children` destructured but never used | Low |
| 13 | Missing | `classes` not defined | Medium |

---

## 3. Refactored code

See [`WalletPage.refactored.tsx`](./WalletPage.refactored.tsx) for a clean implementation that addresses all issues above.

Key changes:
- Correct filter logic (`balancePriority > -99 && balance.amount > 0`)
- Stable sort via arithmetic subtraction
- Proper `useMemo` dependency arrays
- `formattedBalances` used for rendering rows
- Stable, content-based keys
- `getPriority` moved outside the component as a pure function
- Proper TypeScript types (`Blockchain` union, no `any`)
- Safe price access with `?? 0` fallback
- All derived data properly memoized
