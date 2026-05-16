# Problem 3 - Messy React

The original component mixes correctness issues, avoidable recomputation, weak
typing, and React anti-patterns. The largest problems are not stylistic; several
of them change the rendered output or make the code fail TypeScript compilation.

## Issues Found

### Type and compile-time correctness

- `WalletBalance` does not define `blockchain`, but the component reads
  `balance.blockchain`. This should be part of the domain type.
- `getPriority` accepts `any`, which removes TypeScript's protection around a
  known blockchain value.
- The filter references `lhsPriority`, which is not defined. The intended
  variable appears to be `balancePriority`.
- `rows` maps over `sortedBalances` but types each item as
  `FormattedWalletBalance`. At runtime, `sortedBalances` does not include the
  `formatted` field.
- The `sort` comparator can return `undefined` when priorities are equal. A
  comparator must return a number for every branch.
- `Props extends BoxProps` is empty and the component renders a native `div`.
  Unless `BoxProps` is intentionally supported by that `div` or a `Box`
  component, this is an inaccurate public contract.
- `classes.row` is used but `classes` is not defined in the snippet.

### Business logic bugs

- The filter condition is inverted. It currently keeps balances with
  `amount <= 0` when the priority is valid. A wallet page should normally show
  positive balances and hide zero or negative balances.
- The default priority is `-99`, but the broken filter condition makes the
  eligibility rule hard to read and easy to misuse.
- `formattedBalances` is calculated but never used for rendering.
- `balance.amount.toFixed()` defaults to zero decimal places, which is usually
  too lossy for wallet/token balances. Formatting should be explicit.
- `prices[balance.currency] * balance.amount` can produce `NaN` when a price is
  missing.

### React and performance anti-patterns

- `getPriority` is recreated on every render and is listed indirectly inside a
  memoized calculation. A static lookup table is simpler and more stable.
- `prices` is included in the `sortedBalances` dependency array even though
  sorting/filtering does not use prices. That causes unnecessary recomputation
  whenever prices change.
- The code performs multiple passes over the same data:
  `filter -> sort -> map formattedBalances -> map rows`. The unused
  `formattedBalances` pass is pure waste, and the final row data can be prepared
  in one memoized transformation after sorting.
- `Array.prototype.sort` mutates its input. In this specific code the array
  returned by `filter` is new, so `balances` is not mutated, but relying on this
  detail is fragile. Copying before sorting communicates the intent clearly.
- Using `index` as the React `key` can cause incorrect row identity when the
  list is sorted or changes. A stable key from the data should be used.
- The component accepts `children` but never renders it. Either render children
  intentionally or remove it from the destructuring.
- Rendering rows can be memoized as derived row data first, keeping JSX mapping
  simple and avoiding stale or mismatched derived values.

## Refactored Version

```tsx
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
  usdValue: number;
}

type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo';

interface Props extends BoxProps {
  children?: React.ReactNode;
}

const BLOCKCHAIN_PRIORITY: Record<Blockchain, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

const UNKNOWN_BLOCKCHAIN_PRIORITY = -99;

const getPriority = (blockchain: string): number => {
  return BLOCKCHAIN_PRIORITY[blockchain as Blockchain] ?? UNKNOWN_BLOCKCHAIN_PRIORITY;
};

const formatTokenAmount = (amount: number): string => {
  return amount.toFixed(2);
};

const WalletPage: React.FC<Props> = ({ children, ...rest }) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  const rows = useMemo<FormattedWalletBalance[]>(() => {
    return [...balances]
      .filter((balance) => {
        return getPriority(balance.blockchain) > UNKNOWN_BLOCKCHAIN_PRIORITY
          && balance.amount > 0;
      })
      .sort((left, right) => {
        return getPriority(right.blockchain) - getPriority(left.blockchain);
      })
      .map((balance) => {
        const price = prices[balance.currency] ?? 0;

        return {
          ...balance,
          formatted: formatTokenAmount(balance.amount),
          usdValue: price * balance.amount,
        };
      });
  }, [balances, prices]);

  return (
    <div {...rest}>
      {children}
      {rows.map((balance) => (
        <WalletRow
          className={classes.row}
          key={`${balance.blockchain}:${balance.currency}`}
          amount={balance.amount}
          usdValue={balance.usdValue}
          formattedAmount={balance.formatted}
        />
      ))}
    </div>
  );
};
```

## Why This Is Better

- The transformation now has one clear data flow: validate balances, sort by
  priority, then derive display values.
- TypeScript describes the real data shape instead of hiding missing fields with
  `any`.
- Filtering now keeps only supported blockchains with positive balances.
- The sort comparator is deterministic and always returns a number.
- Price and formatted amount are calculated in the same memoized transformation
  that produces the renderable row data.
- React keys are stable across sorting and insertion.
- Missing prices produce a safe zero USD value instead of `NaN`.

## Further Production Improvements

- Replace `balance.amount` as `number` with a decimal-safe representation if
  token precision matters. JavaScript floating-point numbers are not ideal for
  financial calculations.
- Use `Intl.NumberFormat` or a token-aware formatter for display formatting
  instead of a hardcoded `toFixed(2)`.
- If unsupported blockchains should still render with low priority, keep them
  with a default priority instead of filtering them out.
- Prefer a concrete container prop type, such as
  `React.ComponentPropsWithoutRef<'div'>`, if the component renders a `div`
  rather than a design-system `Box`.
