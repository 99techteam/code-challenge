# Messy React README

## Overview

The `WalletPage` React component displays wallet balances with USD values and formatted amounts. The original code had issues with logic, performance, and TypeScript safety. The optimized version resolves these, improving efficiency and maintainability.

---

## Error 1: Logic Error in `sortedBalances`

**Explanation of Issue**:

- Used undefined `lhsPriority` instead of `balancePriority` in `filter`, causing runtime errors.
- `amount <= 0` condition incorrectly kept invalid balances (likely meant to keep `amount > 0`).
- `filter` excluded blockchains with priority `<= -99` regardless of `amount`, potentially incorrect.

**Original Code**:

```javascript
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
```

**Solution**:

- Correct `lhsPriority` to `balancePriority`.
- Update `filter` to keep `amount > 0` and `priority > -99`.
- Simplify `sort` with `rhs.priority - lhs.priority`.
- Precompute `priority` in `map` to call `getPriority` once per balance.

**New Code**:

```javascript
const sortedBalances = useMemo(() => {
  return balances
    .map((balance: WalletBalance) => ({
      ...balance,
      priority: getPriority(balance.blockchain),
    }))
    .filter((balance) => balance.priority > -99 && balance.amount > 0)
    .sort((lhs, rhs) => rhs.priority - lhs.priority);
}, [balances, getPriority]);
```

---

## Error 2: Missing `prices[balance.currency]` Check

**Explanation of Issue**:

- Calculating `usdValue` assumed `prices[balance.currency]` existed, risking `undefined * number` errors.

**Original Code**:

```javascript
const usdValue = prices[balance.currency] * balance.amount;
```

**Solution**:

- Add fallback to 0 if `prices[balance.currency]` is undefined.

**New Code**:

```javascript
const usdValue = prices[balance.currency]
  ? prices[balance.currency] * balance.amount
  : 0;
```

---

## Error 3: Unused `formattedBalances`

**Explanation of Issue**:

- Created `formattedBalances` but used `sortedBalances` in `rows`, wasting computation and ignoring `formatted` property.

**Original Code**:

```javascript
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
```

**Solution**:

- Merge `formattedBalances` into `rows` to avoid extra array iteration.
- Use `Intl.NumberFormat` for flexible currency formatting.

**New Code**:

```javascript
const rows = sortedBalances.map(
  (balance: WalletBalance & { priority: number }, index: number) => {
    const usdValue = prices[balance.currency]
      ? prices[balance.currency] * balance.amount
      : 0;
    const formatted = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(balance.amount);
    return (
      <WalletRow
        className={classes.row}
        key={`${balance.currency}-${balance.blockchain}`}
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={formatted}
      />
    );
  }
);
```

---

## Error 4: Inefficient `useMemo` Dependencies

**Explanation of Issue**:

- Included `prices` in `useMemo` dependencies despite not using it in `sortedBalances`, causing unnecessary re-computations.

**Original Code**:

```javascript
const sortedBalances = useMemo(() => {
  // ...filter and sort logic...
}, [balances, prices]);
```

**Solution**:

- Remove `prices` from dependencies.
- Memoize `getPriority` with `useCallback` and include it in dependencies.

**New Code**:

```javascript
const getPriority = useCallback((blockchain: string): number => {
  switch (blockchain) {
    case "Osmosis":
      return 100;
    case "Ethereum":
      return 50;
    case "Arbitrum":
      return 30;
    case "Zilliqa":
      return 20;
    case "Neo":
      return 20;
    default:
      return -99;
  }
}, []);
const sortedBalances = useMemo(() => {
  // ...filter and sort logic...
}, [balances, getPriority]);
```

---

## Error 5: Weak TypeScript Types

**Explanation of Issue**:

- `blockchain` typed as `any` in `getPriority`, reducing TypeScript safety.
- Missing types for `BoxProps` and `WalletRow` props, risking prop errors.

**Original Code**:

```javascript
const getPriority = (blockchain: any): number => {
  // ...switch logic...
};
interface Props extends BoxProps {}
```

**Solution**:

- Type `blockchain` as `string`.
- Define `BoxProps` and `WalletRowProps` explicitly.

**New Code**:

```javascript
const getPriority = useCallback((blockchain: string): number => {
  // ...switch logic...
}, []);
interface BoxProps {
  className?: string;
  [key: string]: any;
}
interface WalletRowProps {
  className: string;
  amount: number;
  usdValue: number;
  formattedAmount: string;
}
interface Props extends BoxProps {}
```

---

## Error 6: No Empty State or Input Validation

**Explanation of Issue**:

- No fallback UI for empty `sortedBalances` or invalid `balances`/`prices`.
- Assumed `balances` and `prices` valid without checking structure.

**Original Code**:

```javascript
return <div {...rest}>{rows}</div>;
```

**Solution**:

- Check `Array.isArray(balances)` and `typeof prices === 'object'`.
- Add fallback UI for loading and empty states.

**New Code**:

```javascript
if (!Array.isArray(balances) || typeof prices !== "object" || prices === null) {
  return <div>Loading...</div>;
}
if (rows.length === 0) {
  return <div>No balances available</div>;
}
return <div {...rest}>{rows}</div>;
```

---

## Error 7: Inefficient `getPriority` in `sort`

**Explanation of Issue**:

- Called `getPriority` twice per comparison in `sort`, increasing computational cost (O(n log n) for `getPriority` calls).

**Original Code**:

```javascript
.sort((lhs: WalletBalance, rhs: WalletBalance) => {
  const leftPriority = getPriority(lhs.blockchain);
  const rightPriority = getPriority(rhs.blockchain);
  if (leftPriority > rightPriority) {
    return -1;
  } else if (rightPriority > leftPriority) {
    return 1;
  }
});
```

**Solution**:

- Precompute `priority` in `map`, reducing `getPriority` calls to O(n).

**New Code**:

```javascript
.map((balance: WalletBalance) => ({
  ...balance,
  priority: getPriority(balance.blockchain),
}))
.sort((lhs, rhs) => rhs.priority - lhs.priority);
```

---

## Error 8: Non-Optimal `key` in `rows`

**Explanation of Issue**:

- Used `key={index}`, which could cause unnecessary re-renders on array changes.

**Original Code**:

```javascript
key = { index };
```

**Solution**:

- Use unique `key` based on `currency` and `blockchain`.

**New Code**:

```javascript
key={`${balance.currency}-${balance.blockchain}`}
```

---

## Additional Improvements

- **Pagination**: Implement for large lists to optimize rendering.
- **Error Handling**: Add `ErrorBoundary` for robust error management.