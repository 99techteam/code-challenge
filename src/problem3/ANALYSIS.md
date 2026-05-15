# Problem 3 — Code Review: `WalletPage`

## Issues & Fixes

| # | Issue | Fix |
|---|-------|-----|
| 1 | `lhsPriority` used but never declared → `ReferenceError` | Rename to `balancePriority` |
| 2 | Filter keeps `amount <= 0` (inverted logic) | Change to `amount > 0` |
| 3 | `getPriority` re-created on every render | Move outside the component |
| 4 | `blockchain: any` — no type safety | Use a `Blockchain` union type |
| 5 | `prices` in `useMemo` deps but unused inside it | Remove from dependency array |
| 6 | `formattedBalances` computed but never used (dead code) | Merge into the same `useMemo` chain |
| 7 | `rows` maps `sortedBalances` but accesses `.formatted` (doesn't exist) | Map the formatted array instead |
| 8 | `key={index}` on a sorted/filtered list | Use `key={balance.currency}` |
| 9 | `sort` comparator returns `undefined` when priorities are equal | Return `0` explicitly (or use subtraction) |
| 10 | `children` destructured from props but never rendered | Remove from destructuring |
| 11 | `filter` → `sort` → `map` = 3 array passes + 2 intermediate allocations | Combine `filter` + `map` into one `reduce` → 2 passes total |

## Note: `useMemo` and referential stability of `balances`

`useMemo` uses `Object.is` (reference equality) to compare dependencies. Since `balances` is an array, the memo only skips recomputation if `useWalletBalances()` returns the **same array reference** between renders.

If the hook returns a new array every render, `useMemo` recomputes every render — making it useless. To guard against this:

```tsx
// Stabilize the reference if useWalletBalances() is not internally memoized
const stableBalances = useMemo(() => balances, [JSON.stringify(balances)]);
```

> The ideal fix is ensuring `useWalletBalances` returns a stable reference internally.

## Refactored Version

```tsx
type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo';

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

// O(1) lookup table — moved outside component, no re-creation on render
const BLOCKCHAIN_PRIORITY: Record<Blockchain, number> = {
  Osmosis:  100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa:  20,
  Neo:      20,
};

const getPriority = (blockchain: Blockchain): number =>
  BLOCKCHAIN_PRIORITY[blockchain] ?? -99;

interface Props extends BoxProps {}

const WalletPage: React.FC<Props> = (props: Props) => {
  const { ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  // reduce: filter + format in one O(n) pass, then sort O(n log n)
  const sortedAndFormattedBalances = useMemo((): FormattedWalletBalance[] => {
    const formatted = balances.reduce<FormattedWalletBalance[]>((acc, balance) => {
      if (getPriority(balance.blockchain) > -99 && balance.amount > 0) {
        acc.push({ ...balance, formatted: balance.amount.toFixed() });
      }
      return acc;
    }, []);

    return formatted.sort((lhs, rhs) =>
      getPriority(rhs.blockchain) - getPriority(lhs.blockchain)
    );
  }, [balances]); // prices intentionally excluded — not used in this memo

  const rows = sortedAndFormattedBalances.map((balance: FormattedWalletBalance) => {
    const usdValue = prices[balance.currency] * balance.amount;
    return (
      <WalletRow
        className={classes.row}
        key={balance.currency}
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.formatted}
      />
    );
  });

  return <div {...rest}>{rows}</div>;
};
```
