# Problem 3 — Refactoring Log

> [`src/WalletPage.tsx`](./src/WalletPage.tsx) holds both: the snippet as provided, unchanged
> in a comment at the top, then the refactor below it.

`WalletPage` should list the wallet's non-empty balances on supported chains, highest
priority first, each with its USD value. As given, it crashes on the first balance.

## Computational inefficiencies

| #   | What was messy                                                                                                                           | What we refactored                                                                                         |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 1   | `useMemo` lists `prices` as a dependency but never reads it, so every price update re-filters and re-sorts the list.                     | Depends on `balances` only. Each row's USD value is worked out at render.                                  |
| 2   | `getPriority` is recreated on every render, and the sort calls it twice per comparison: O(n log n) lookups for values that never change. | A module-level `Map`. Each priority is looked up once while filtering, and the sort subtracts two numbers. |
| 3   | `formattedBalances` is rebuilt on every render and never used.                                                                           | Amounts are formatted once, inside the memo, and the rows use them.                                        |

## Anti-patterns

| #   | What was messy                                                                                                                                                       | What we refactored                                                                                    |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 4   | `key={index}` on a filtered, sorted list. When the order changes, React reuses rows by position, so a row's DOM and state end up on the wrong balance.               | A stable key from chain and currency: `` `${blockchain}:${currency}` ``.                              |
| 5   | `Props extends BoxProps {}`: an empty interface over MUI's `Box` props, spread onto a plain `<div>`. Props like `sx` and `component` end up as junk HTML attributes. | `Omit<ComponentProps<'div'>, 'children'>`: the props of the element it actually renders.              |
| 6   | `children` is destructured and then dropped, so anything passed in disappears.                                                                                       | Removed from the props type, so passing children is a compile error.                                  |
| 7   | The code reads `balance.blockchain`, but `WalletBalance` has no such field, and `getPriority` takes `any`.                                                           | `blockchain: string` is declared, and there is no `any`.                                              |
| 8   | `FormattedWalletBalance` copies `WalletBalance`'s fields instead of extending it.                                                                                    | `FormattedWalletBalance extends WalletBalance`.                                                       |
| 9   | Priorities are a `switch` of magic numbers, with `-99` as an "unsupported" flag that the filter has to repeat.                                                       | A `Map` from chain to priority. A chain missing from the map is not listed.                           |
| 10  | The sort comparator returns `undefined` for equal priorities. That is a type error, and it only sorts correctly by accident.                                         | `(a, b) => b.priority - a.priority`.                                                                  |
| 11  | The filter is nested `if`s that return `true` or `false`.                                                                                                            | One boolean expression.                                                                               |
| 12  | Callback parameters are typed by hand, and `(balance: FormattedWalletBalance)` claims a `formatted` field the items don't have.                                      | No hand-written annotations. The types come from the hooks.                                           |
| 13  | `React.FC<Props>` and `(props: Props)` declare the props type twice.                                                                                                 | `function WalletPage(props: WalletPageProps)`.                                                        |
| 14  | The filter, sort and format rules live inside the component, so testing them means rendering it.                                                                     | Pure functions, `toVisibleBalances` and `usdValueOf`, outside the component and tested without React. |
| 15  | Mixed tabs and spaces, and missing semicolons.                                                                                                                       | Formatted by Prettier, which CI checks.                                                               |

## Bugs

| #   | What was messy                                                                                                         | What we refactored                                                                                   |
| --- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 16  | The filter reads `lhsPriority`, which doesn't exist, so the page crashes with a `ReferenceError` on the first balance. | The filter uses the priority it just looked up.                                                      |
| 17  | The filter keeps balances of zero or less, so it hides everything the wallet actually holds.                           | It keeps `amount > 0`.                                                                               |
| 18  | The rows are built from `sortedBalances`, so `formatted` is always `undefined`.                                        | The rows use the single memoised list, which includes `formatted`.                                   |
| 19  | `toFixed()` rounds to whole numbers, so 0.4 ETH shows as `0`.                                                          | `Intl.NumberFormat` with up to 6 decimals and thousands separators, created once.                    |
| 20  | A currency with no price gets `NaN` as its USD value.                                                                  | The row gets `usdValue: undefined`, so it can say "No price" rather than `NaN` or a misleading `$0`. |
| 21  | `WalletRow` never gets the currency, so a row can't show which asset it is.                                            | `currency` is passed too.                                                                            |

## Files

| File                                                   | What it is                                                                                        |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| [`src/WalletPage.tsx`](./src/WalletPage.tsx)           | The snippet as provided, in a comment, then the refactor: types, rules and component in one file. |
| [`src/WalletPage.test.tsx`](./src/WalletPage.test.tsx) | The rules tested without React, then the page's rows, memo and keys.                              |

The hooks, `WalletRow` and `classes` belong to the app around the snippet, so the file
`declare`s them instead of implementing them. It type-checks on its own, and the tests stand
them in with `vi.stubGlobal`.
