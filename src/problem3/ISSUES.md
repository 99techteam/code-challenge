# Issues found in the original code

1. **Undefined variable `lhsPriority`** — the filter uses `lhsPriority` but only
   `balancePriority` was declared. This throws a `ReferenceError` at runtime.

2. **Inverted filter logic** — the filter keeps balances where
   `balance.amount <= 0`, which keeps empty/zero/negative balances and drops
   the ones actually worth displaying. It should keep `amount > 0`.

3. **`blockchain` used but not typed** — `WalletBalance` has no `blockchain`
   field, so `getPriority(balance.blockchain)` only compiles because the
   parameter is typed `any`. This hides a real type error.

4. **Sort comparator missing an equal case** — when `leftPriority === rightPriority`
   the comparator falls through and returns `undefined` instead of `0`,
   which is not a valid `Array.prototype.sort` comparator return value.

5. **`useMemo` depends on `prices` but never uses it** — `sortedBalances` only
   reads `balances` and `getPriority`. The `prices` dependency causes
   pointless recomputation every time prices tick.

6. **`formattedBalances` is computed then discarded** — `rows` maps over
   `sortedBalances` again (not `formattedBalances`), so the formatting work
   is wasted, and the `balance` passed to `WalletRow` is typed as
   `FormattedWalletBalance` while actually being a plain `WalletBalance`
   (no `formatted` field at runtime).

7. **`toFixed()` with no argument** — always rounds to whole numbers,
   losing precision for any token with meaningful decimals.

8. **`getPriority` recreated every render** — it's a pure function with no
   dependency on props/state, so defining it inside the component body
   (and calling it repeatedly for the same blockchain during sort) is
   wasted work. It belongs outside the component, as a constant lookup.

9. **List keyed by array `index`** — `key={index}` breaks React's
   reconciliation when the list reorders/filters (which it does every
   render here), causing unnecessary DOM churn and potential state bugs
   in `WalletRow`. Should key by a stable id (`balance.currency` here).

10. **`children` destructured but never rendered** — `const { children, ...rest } = props`
    pulls `children` out and then only `rows` are rendered inside the
    `div`, silently dropping anything passed as children.

11. **Empty interface extension** — `interface Props extends BoxProps {}`
    adds nothing over `type Props = BoxProps`.
