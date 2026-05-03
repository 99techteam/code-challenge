# Problem 3: Wallet Page Code Review

## Summary

The original code has several correctness bugs, computational inefficiencies, and React/TypeScript anti-patterns. The biggest problems are:

- It references variables and fields that do not exist in the declared types.
- It filters balances with incorrect logic.
- It sorts with an incomplete comparator.
- It calculates formatted balances but never uses them.
- It recomputes derived data more often than necessary.
- It uses weak TypeScript types and unstable React keys.

## Issues Found

### 1. `WalletBalance` type is incomplete

The code uses `balance.blockchain`, but the interface only defines:

```ts
interface WalletBalance {
  currency: string;
  amount: number;
}
```

This means the code either does not compile or relies on incorrect assumptions about the data shape.

Improvement:

```ts
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain;
}
```

### 2. `getPriority` uses `any`

```ts
const getPriority = (blockchain: any): number => {}
```

Using `any` removes TypeScript safety. The valid blockchain values are known, so they should be represented as a union type or enum.

### 3. `getPriority` is recreated on every render

Because `getPriority` is declared inside the component, it is recreated every render. The function is pure and does not depend on component state, so it should be moved outside the component.

### 4. Filtering logic has a variable bug

The filter uses:

```ts
if (lhsPriority > -99) {
```

`lhsPriority` does not exist in that scope. The intended variable appears to be `balancePriority`.

### 5. Filtering logic is inverted

The current code keeps balances where:

```ts
balance.amount <= 0
```

For a wallet page, zero or negative balances usually should be excluded. The intended condition should likely be:

```ts
balancePriority > -99 && balance.amount > 0
```

### 6. `useMemo` dependencies are incorrect

```ts
}, [balances, prices]);
```

`prices` is not used inside the sorting/filtering logic, so including it causes unnecessary recomputation whenever prices change.

### 7. Sort comparator does not return `0`

The comparator returns `-1` or `1`, but returns `undefined` when priorities are equal.

```ts
if (leftPriority > rightPriority) return -1;
if (rightPriority > leftPriority) return 1;
```

Comparator functions should always return a number. Missing `0` can lead to unstable or engine-dependent behavior.

### 8. `formattedBalances` is computed but unused

The code calculates:

```ts
const formattedBalances = sortedBalances.map(...)
```

But then renders rows from `sortedBalances`, not `formattedBalances`.

This is both a bug and wasted computation.

### 9. Incorrect type in `rows` mapping

```ts
sortedBalances.map((balance: FormattedWalletBalance) => ...)
```

`sortedBalances` contains `WalletBalance`, not `FormattedWalletBalance`. This hides the earlier bug where `formatted` does not exist on the rendered balance.

### 10. Multiple passes over the same data

The code does:

1. `filter`
2. `sort`
3. `map` to formatted balances
4. `map` again to rows

Some of this is reasonable, but the current version performs an unused map and then renders from the wrong array. Derived display data should be computed once inside a single `useMemo`.

### 11. `rows` is not memoized

Rows are recreated on every render. For small lists this is acceptable, but for wallet balances it is cleaner to memoize the full derived row data and then render it.

Important distinction: do not prematurely memoize everything. Here, memoization is useful because sorting and mapping are derived computations from `balances` and `prices`.

### 12. Uses array index as React key

```tsx
key={index}
```

Using the index can cause incorrect row reuse when the list order changes. Wallet rows should use a stable key, such as `blockchain + currency`.

### 13. Possible `NaN` USD values

```ts
const usdValue = prices[balance.currency] * balance.amount;
```

If `prices[balance.currency]` is missing, the result becomes `NaN`.

Use a fallback:

```ts
const usdValue = (prices[balance.currency] ?? 0) * balance.amount;
```

### 14. Empty `Props` interface adds noise

```ts
interface Props extends BoxProps {}
```

This does not add information. Either use `BoxProps` directly or add meaningful props.

### 15. `children` is destructured but unused

```ts
const { children, ...rest } = props;
```

If the component does not render `children`, it should not destructure it. If children are expected, render them intentionally.

### 16. `React.FC<Props>` is unnecessary

Using `React.FC<Props>` is not wrong, but it is often unnecessary. A plain function component is simpler and avoids implicit `children` behavior.

### 17. `classes` is referenced but not defined

```tsx
className={classes.row}
```

The snippet does not define `classes`, so the component is incomplete or depends on hidden outer scope.

## Refactored Version

```tsx
type Blockchain = "Osmosis" | "Ethereum" | "Arbitrum" | "Zilliqa" | "Neo";

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
  usdValue: number;
}

interface Props extends BoxProps {}

const BLOCKCHAIN_PRIORITY: Record<Blockchain, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

const getPriority = (blockchain: Blockchain): number => {
  return BLOCKCHAIN_PRIORITY[blockchain] ?? -99;
};

const WalletPage = (props: Props) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  const formattedBalances = useMemo<FormattedWalletBalance[]>(() => {
    return balances
      .filter((balance) => {
        return getPriority(balance.blockchain) > -99 && balance.amount > 0;
      })
      .sort((left, right) => {
        return getPriority(right.blockchain) - getPriority(left.blockchain);
      })
      .map((balance) => {
        const price = prices[balance.currency] ?? 0;

        return {
          ...balance,
          formatted: balance.amount.toFixed(2),
          usdValue: price * balance.amount,
        };
      });
  }, [balances, prices]);

  return (
    <div {...props}>
      {formattedBalances.map((balance) => (
        <WalletRow
          className={classes.row}
          key={`${balance.blockchain}-${balance.currency}`}
          amount={balance.amount}
          usdValue={balance.usdValue}
          formattedAmount={balance.formatted}
        />
      ))}
    </div>
  );
};
```

## Further Improvements

If this were production code, I would also consider:

- Rendering a proper empty state when there are no balances.
- Using a locale-aware formatter instead of `toFixed`.
- Passing `currency` to `WalletRow` if the row needs to display the token symbol.
- Moving `BLOCKCHAIN_PRIORITY` to a shared constants file if used elsewhere.
- Adding tests for filtering, sorting, formatting, and missing price behavior.

## Final Takeaway

The main fix is to separate data preparation from rendering:

- Normalize and sort balances in `useMemo`.
- Format balances in the same derived data step.
- Render from the formatted result.
- Keep types accurate so bugs are caught before runtime.
