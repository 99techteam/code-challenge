# Problem 3: Messy React

Refactored version: [`WalletPage.tsx`](./WalletPage.tsx).

Assumptions: `BoxProps`, `useWalletBalances`, `usePrices`, `WalletRow` and `classes` come from the surrounding app, as in the original snippet. `usePrices()` returns `Record<string, number>` keyed by currency.

## Bugs

1. **`lhsPriority` is undefined.** The filter declares `balancePriority` but reads `lhsPriority`, which throws a `ReferenceError` on the first render with data.
2. **Inverted filter.** `balance.amount <= 0` keeps empty and negative balances and drops real holdings. It must be `> 0`.
3. **`blockchain` missing from `WalletBalance`.** `getPriority(balance.blockchain)` does not type check.
4. **Comparator never returns `0`.** Equal priorities (Zilliqa and Neo) fall through and return `undefined`, which makes the order implementation defined and not stable across engines. Fix: `r.priority - l.priority` with a deterministic tie break on `currency`.
5. **`rows` maps `sortedBalances`, not `formattedBalances`.** `balance.formatted` is `undefined` at runtime, so `formattedAmount` is never populated. The `FormattedWalletBalance` annotation on the callback hides this from the compiler. `formattedBalances` is computed and then thrown away.
6. **`toFixed()` without digits rounds to an integer.** `0.0042 ETH` renders as `0`. Use `Intl.NumberFormat` with explicit fraction digits.
7. **Missing price gives `NaN`.** `prices[balance.currency]` is `undefined` for unlisted tokens, so `usdValue` becomes `NaN`. Fall back with `?? 0`.

## Inefficiencies and anti-patterns

1. **`getPriority` lives inside the component.** It is rebuilt every render and runs `O(n log n)` times inside the comparator. Hoist the table to a module level `Record` and compute each priority once per item (decorate, sort, undecorate). Lookups use `Object.hasOwn` so prototype keys such as `"constructor"` are not treated as known chains.
2. **`switch` and magic `-99`.** The sentinel conflates "unknown chain" with a priority value. A lookup that reports a missing key states the intent directly.
3. **Wrong `useMemo` dependencies.** `prices` is listed but never read, so every price tick re-filters and re-sorts. The correct dependency is `[balances]`.
4. **Formatting and row creation run on every render** outside `useMemo`. Rows now depend only on `sortedBalances` and `prices`.
5. **Three passes (`filter`, `sort`, `map`) and extra intermediate arrays.** One loop builds the ranked list, then a single sort runs on the already filtered data, so fewer items are compared.
6. **`key={index}`.** Index keys remount or mis-reuse rows when the list reorders as balances change. Use the stable identity `blockchain:currency`.
7. **`any` on `blockchain`.** It disables type checking where the bug 3 above surfaced. Use `string`, or a union if the chain set is closed.
8. **`FormattedWalletBalance` duplicates `WalletBalance`.** With formatting done at render, the type is no longer needed. Otherwise use `extends WalletBalance`.
9. **Unused `children` destructuring and redundant `props: Props` annotation** on `React.FC`. The refactor takes `props` directly and drops `React.FC`, which adds nothing here. JSX children override `props.children` on the `div`.
10. **Inconsistent indentation (tabs and spaces) and missing semicolons.** Enforce with Prettier and ESLint (`react-hooks/exhaustive-deps` would have flagged the dependency list).
11. **No `React.memo` on `WalletRow`.** With stable keys and primitive props, memoizing it skips re-render for rows whose values did not change.
