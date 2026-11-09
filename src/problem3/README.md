# Messy React

## Issues in the original

### Correctness and types

1. **`lhsPriority` is undefined in the filter.** The computed variable is named
   `balancePriority`. This is a compile error, not just a performance issue.
2. **`WalletBalance` has no `blockchain`.** Every access to `balance.blockchain`
   contradicts the declared type. Add it to the model and type the priority function
   with `string` rather than `any`; unknown chains can still be handled explicitly.
3. **The amount predicate appears inverted.** `amount <= 0` keeps zero and negative
   holdings and drops positive ones. Assuming this is a list of spendable balances,
   keep finite, positive amounts on supported chains.
4. **The sort comparator has no equality result.** Return 0 for equal priorities.
   Falling through returns `undefined`, which JavaScript sorting treats like equality,
   but it is an incomplete numeric comparator and can fail TypeScript checking.
5. **The formatted array is never used.** Rows map `sortedBalances`, yet annotate
   its items as `FormattedWalletBalance`. That annotation cannot create a `formatted`
   field; it is absent at runtime and incompatible with the source item type.
6. **Missing prices produce `NaN`.** Multiplying an absent price by the amount does
   not give a usable USD value. Show an unavailable state instead of silently treating
   it as zero. Also guard nonfinite values and overflow.
7. **`toFixed()` defaults to zero decimal places.** Fractional token holdings would
   look rounded to whole tokens. Choose a display policy separately from calculation.
8. **Array-index keys are unstable.** A change in sorting or filtering can attach
   row state to the wrong holding. Use a stable holding ID, not currency alone: the
   same currency may exist on multiple chains or accounts.

### Computation and component boundaries

9. **`prices` unnecessarily invalidates the sort memo.** The filter and comparator
   do not read prices. Depend on balances only; use current prices when rendering.
10. **Priority is recalculated during every comparison.** Sorting runs O(n log n)
    comparisons. Decorate each holding with its priority once before filtering and
    sorting. The overall complexity remains O(n log n), with O(n) extra storage.
11. **`getPriority` is recreated inside the component.** Move this pure helper outside.
    The original memo also closes over that local function without listing it as a
    dependency; hoisting removes the dependency issue without adding `useCallback`.
12. **Formatting traverses and allocates an unused array every render.** Format at
    the row boundary instead. A price update still needs to update row valuations;
    memoizing everything or adding `React.memo` without measurement is not necessary.
13. **The wrapper API is inconsistent.** It accepts `children` and drops them, and
    spreads `BoxProps` onto a plain div even though some Box styling props may not be
    valid DOM attributes. Use the actual Box component, or declare native div props.
    The empty `Props extends BoxProps` interface itself adds no information.

`filter(...).sort(...)` in the original does **not** mutate the hook's input array:
`filter` already makes a new array. The refactor also sorts a derived array. Avoiding
input mutation still matters because the memo assumes immutable balance updates.

## Refactored version

- [WalletPage.tsx](WalletPage.tsx) contains the component and a minimal row.
- [balances.ts](balances.ts) owns filtering, priority and USD-value rules.
- [balances.test.tsx](balances.test.tsx) exercises the rules and server-rendered output.

The prompt does not provide the hooks, Box, WalletRow or stylesheet implementations.
This version takes `balances` and `prices` as typed props so it compiles and can be
tested without inventing a wallet service. An application can pass the results of
`useWalletBalances()` and `usePrices()` directly. The balance adapter must supply a
stable, unique `id` per holding and replace the array when balances change.

Assumptions: unsupported chains are excluded; equal priorities keep source order;
amounts display up to eight significant digits and USD uses two decimal places.
Formatting never feeds back into the calculation. Missing USD prices remain visible
as unavailable, children render after the rows, and native wrapper attributes are
forwarded. There is no claim of transaction-grade floating-point precision.

Run `bun test src/problem3` and `bun run typecheck` from the repository root.
