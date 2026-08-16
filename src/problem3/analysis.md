# Problem 3: Messy React — Issues Found

## Computational inefficiencies / anti-patterns

1. **`lhsPriority` is undefined — the filter is broken (bug, not just inefficient).**
   The filter callback reads `lhsPriority`, but only `balancePriority` was
   declared. This throws a `ReferenceError` at runtime (or silently returns
   `undefined`/falsy under loose settings), so the filter never behaves as
   intended.

2. **The filter logic is inverted relative to what it's named for.**
   `if (balance.amount <= 0) return true` keeps balances with **zero or
   negative** amount and drops everything with a positive amount. A wallet
   page almost certainly wants to display balances the user actually holds
   (`amount > 0`), so the condition is backwards.

3. **`getPriority` takes `blockchain: any`.**
   `any` throws away type safety for the one function driving the sort/filter
   logic. A `Blockchain` union/string-literal type would let TypeScript catch
   typos and missing cases at compile time.

4. **`getPriority` is redefined on every render.**
   It's a pure function of `blockchain` with no dependency on component state
   or props, so it doesn't need to live inside the component — it's
   recreated (a new function reference) on every render for no benefit and,
   because it's not memoized, forces `useMemo`/`useCallback` consumers that
   depend on it to also recompute needlessly if it were ever added as a
   dependency. It also encodes blockchain priority as a hardcoded
   switch — a lookup object (`Record<string, number>`) is more scalable and
   removes the fallthrough-prone `switch`.

5. **`useMemo` dependency array includes `prices` but the computation never
   uses `prices`.**
   `sortedBalances` is derived only from `balances` and `getPriority`.
   Including `prices` causes the (already expensive, unstable) filter+sort to
   re-run every time prices update — e.g. on every price tick — even though
   the result wouldn't change. This is wasted CPU work.

6. **The `sort` comparator has no `return` for the equal-priority case.**
   When `leftPriority === rightPriority`, the comparator falls off the end
   and returns `undefined`. Modern engines tolerate this, but it's undefined
   behavior per the spec and should return `0` explicitly for a stable,
   correct sort.

7. **`sortedBalances.filter/sort` is recomputed, then mapped twice
   (`formattedBalances`, then `rows` from `sortedBalances` again).**
   `formattedBalances` is computed but never used — `rows` maps over
   `sortedBalances` again and recomputes `toFixed()` inline instead of reusing
   `formattedBalances`. This is dead code plus a wasted pass over the array.

8. **`rows` maps `sortedBalances: WalletBalance[]` but types the callback
   parameter as `FormattedWalletBalance`.**
   `WalletBalance` has no `formatted` field, so `balance.formatted` is
   accessing a property TypeScript shouldn't allow — this only "works"
   because `sortedBalances` is implicitly typed as `any[]` (a consequence of
   issue #3) or because the annotation is simply wrong and the compiler isn't
   catching it. Either way, types and runtime data are out of sync.

9. **`getPriority(balance.blockchain)` is called once per item in the filter
   and again per item in the sort comparator (up to ~2n log n calls) — and a
   third time isn't needed but nothing is memoized.**
   For a hot list (wallet balances re-rendering on every price change), it's
   cheap to precompute `{ ...balance, priority: getPriority(balance.blockchain) }`
   once and sort/filter on the cached value instead of recalculating.

10. **`key={index}` on `<WalletRow>`.**
    Using the array index as the React key is an anti-pattern for a list that
    can reorder (which this one explicitly does, via sorting) or have items
    added/removed — React can misassign state/DOM across re-renders. A stable
    identifier such as `balance.currency` (assuming currencies are unique per
    wallet) should be used instead.

11. **`WalletBalance` is missing the `blockchain` field used throughout.**
    `getPriority(balance.blockchain)` and the sort/filter all reference
    `balance.blockchain`, but the `WalletBalance` interface only declares
    `currency` and `amount`. This compiles only because `blockchain` access
    on an implicitly-`any` value is unchecked — fixing the `any` in
    `getPriority` (issue #3) would surface this as a real type error that
    needs a proper fix: adding `blockchain: string` to the interface.

12. **`prices[balance.currency] * balance.amount` isn't guarded against a
    missing price.**
    If a currency isn't present in `prices`, this evaluates to `NaN` and
    renders `usdValue={NaN}` silently instead of handling the missing-price
    case explicitly (e.g. skip the row, or show a loading/placeholder state).

## Refactored version

```tsx
import { useMemo } from "react";

interface WalletBalance {
  currency: string;
  blockchain: string;
  amount: number;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
  usdValue: number;
}

interface Props extends BoxProps {}

const BLOCKCHAIN_PRIORITY: Record<string, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

function getPriority(blockchain: string): number {
  return BLOCKCHAIN_PRIORITY[blockchain] ?? -99;
}

const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  const formattedBalances = useMemo<FormattedWalletBalance[]>(() => {
    return balances
      .filter((balance) => getPriority(balance.blockchain) > -99 && balance.amount > 0)
      .sort((lhs, rhs) => getPriority(rhs.blockchain) - getPriority(lhs.blockchain))
      .map((balance) => ({
        ...balance,
        formatted: balance.amount.toFixed(2),
        usdValue: (prices[balance.currency] ?? 0) * balance.amount,
      }));
  }, [balances, prices]);

  const rows = formattedBalances.map((balance) => (
    <WalletRow
      className={classes.row}
      key={balance.currency}
      amount={balance.amount}
      usdValue={balance.usdValue}
      formattedAmount={balance.formatted}
    />
  ));

  return <div {...rest}>{rows}</div>;
};
```

### What changed and why

- **Filter now keeps positive balances with a known priority** (fixes the
  inverted/broken condition and the `lhsPriority` bug).
- **`getPriority` is a module-level function backed by a lookup object** —
  no per-render recreation, no `switch` fallthrough risk, and it's typed
  (`string -> number`) instead of `any`.
- **One combined `useMemo`** does filter → sort → format → attach `usdValue`
  in a single pass over the array, replacing the three separate passes
  (`sortedBalances`, `formattedBalances`, `rows`) and the dead
  `formattedBalances` variable.
- **`useMemo` depends on exactly what it uses** (`balances`, `prices` — since
  `usdValue` now genuinely depends on `prices`), so it only recomputes when
  one of those actually changes.
- **The sort comparator always returns a number**, including the
  equal-priority case.
- **`blockchain` is a declared field on `WalletBalance`**, and
  `FormattedWalletBalance` extends it instead of redeclaring `currency`/
  `amount`, keeping the two interfaces in sync by construction.
- **`key={balance.currency}`** replaces `key={index}` for stable identity
  across re-sorts.
- **Missing prices default to `0`** instead of silently producing `NaN`,
  making the missing-price case an explicit, visible value rather than a
  silent bug.
