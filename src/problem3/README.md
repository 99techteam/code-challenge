# Problem 3: Messy React

The main problems are correctness and inconsistent data flow, not simply a lack
of memoization. The supplied code cannot typecheck as written, and fixing only
its variable typo would still leave it rendering the wrong balances and missing
formatted values.

## Issues and improvements

### 1. Undefined variable in the filter

The callback calculates `balancePriority` but checks `lhsPriority`, which is not
declared in the supplied scope. TypeScript reports an error; executing this code
as JavaScript with a nonempty array would throw a `ReferenceError`. Use the
priority belonging to the current balance.

### 2. Missing `blockchain` in the balance type

Both filtering and sorting read `balance.blockchain`, but `WalletBalance` declares
only `currency` and `amount`. Model the actual data with a `blockchain` property.
A callback annotation or type assertion cannot add a missing runtime field.

### 3. The amount predicate appears inverted

After fixing the variable typo, the filter retains only `amount <= 0`, excluding
positive holdings and including zero and negative balances. For a holdings view,
use `Number.isFinite(amount) && amount > 0`. Finite validation also prevents an
infinite holding from being displayed.

**Business assumption:** the task does not explicitly specify whether debts or
zero balances should be displayed. This refactor chooses supported, positive
holdings. If the intended view is debts, `<= 0` is not inherently wrong; agree on
that behavior before changing it in a real application.

### 4. Formatted data is calculated but never rendered

`formattedBalances` creates a new array and a copied object for every retained
balance on every render, but the component maps `sortedBalances` into rows instead.
Those objects do not have `formatted`, so the row receives `undefined`.
Annotating the callback parameter as `FormattedWalletBalance` does not transform
the data; under strict function checking it is also incompatible with the array's
element type. Format during the row mapping, or map the actual formatted array.
The refactor uses the former and removes the redundant interface and pass.

### 5. `toFixed()` implicitly rounds to zero decimal places

Without a precision argument, `0.49.toFixed()` becomes `"0"`, which is misleading
for token balances. Choose an explicit display policy. The refactor uses a shared
`Intl.NumberFormat` with up to eight significant digits, retaining small nonzero
values. Formatting is only for display; valuations use the original amount.
For a real wallet, token metadata and product requirements should determine the
precision. [Number.toFixed reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed)

### 6. The comparator does not explicitly handle ties

When priorities match, the callback falls through and returns `undefined`.
Return `rightPriority - leftPriority`, which also returns `0` for ties.
This matters for Neo and Zilliqa, which both have priority 20.

Do not overstate this as necessarily random ordering: JavaScript sort treats a
`NaN` comparison result as equality, and modern ECMAScript requires stable sorting.
An explicit numeric comparator makes the contract correct and clear. Tied rows
in the refactor keep their input order.
[Array.sort reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)

### 7. Unrelated `useMemo` dependency

The selection and sorting callback reads `balances`, not `prices`. Including
`prices` makes a price-object change repeat filtering and sorting even when
holdings are unchanged. Depend on `[balances]`; calculate USD values from current
prices while rendering. This keeps valuations fresh without resorting.

### 8. Component-local helper and `any`

`getPriority` is a pure, static rule but is recreated inside every render and
referenced from the memo without appearing in its dependencies. Move it to module
scope and type its input. Merely adding the recreated function to dependencies
would invalidate the memo each render; `useCallback` is unnecessary for a static
helper. The original helper has no changing captured state, so this is not an
existing stale-closure bug, and its allocation cost alone is small.

The refactor accepts `blockchain: string` to allow unknown chain names to be
filtered at the data boundary. A closed union would be appropriate if the source
already guaranteed only known chains.

### 9. Repeated priority lookup during sorting

Each comparison calls the same switch twice, after the filter already calculated
each item's priority. Compute each priority once, retain it with the balance,
then sort the ranked records. The improvement is a constant-factor reduction;
five switch cases are cheap, and the sort still dominates for large inputs.

### 10. Array-index keys are unsuitable for this sorted list

Filtering or reordering can make the same index refer to a different holding.
React may then reuse row state or DOM for the wrong balance. Use a stable ID
provided by the data layer, not an index, random value or ID generated in render.

`currency` is not necessarily unique across chains or contracts. Even
`blockchain + currency` is only safe with an explicit uniqueness guarantee. The
refactor adds a required `id` representing a unique balance position; the data
layer must supply it, for example from account, chain and asset identity.
[React list keys](https://react.dev/learn/rendering-lists)

### 11. Missing prices silently become `NaN`

`prices[balance.currency]` can be missing; multiplying `undefined` produces `NaN`.
Nonfinite or negative prices are also unsuitable for this valuation. The refactor
returns `null` and displays `Price unavailable`; it does not invent a zero price.
A legitimate price of `0` remains valid, and overflow in the product is guarded.

The example retains the supplied symbol-keyed price contract. In production,
symbol collisions may require chain/contract asset IDs for price lookup too.
JavaScript numbers are adequate for this approximate display example, not exact
on-chain accounting; use base units or decimal arithmetic for that requirement.

### 12. The prop contract and rendered element may not agree

`BoxProps` belongs to an unspecified component library, while the implementation
spreads its rest props onto a native `div`. If those props include system values
such as `p` or `sx`, a native element will not apply the intended styling. Either
render the corresponding `Box`, or type the component with native div props.
The refactor uses `ComponentPropsWithoutRef<'div'>`.

`children` is removed from the rest object and then silently discarded. Render it
if children are supported (the choice here), or omit it from the public API.

### 13. Minor clarity issues, not major performance defects

The empty `Props extends BoxProps` interface adds no information. Explicit
callback annotations duplicate inference and helped conceal the mismatched data
flow. `React.FC<Props>` plus a second `props: Props` annotation is redundant;
`React.FC` itself is not a runtime performance problem.

Imports, hooks, `WalletRow`, `classes` and `BoxProps` are omitted from the prompt.
They may exist in the original application, so their absence alone is not proof
of another application bug.

## What is not an issue

- **The original `filter().sort()` does not mutate `balances`.** `filter` creates
  a new array. Sorting that result mutates only the temporary array. The refactor
  likewise sorts a new array and leaves balance objects unchanged.
- Mapping rows during render is normal React code. Neither every mapping nor
  every row automatically needs `useMemo` or `React.memo`.
- Memoization cannot repair incorrect filtering or missing fields. It is an
  optimization, not a correctness mechanism. Stable immutable balance-array
  references are required to benefit; mutating a retained array in place can leave
  a memoized selection stale. Profile before adding row-level memoization or
  virtualization. [React useMemo guidance](https://react.dev/reference/react/useMemo)

## Refactored code and integration

- [WalletPage.tsx](./WalletPage.tsx): a typed React component and minimal row markup.
- [balances.ts](./balances.ts): pure selection, valuation and display functions.
- [balances.test.tsx](./balances.test.tsx): focused calculation and rendering tests.

This repository supplies no implementation of `useWalletBalances`, `usePrices`,
the UI-library `Box` or `WalletRow`. To make the submission typecheck and test
without inventing those dependencies, the component receives balances and prices
as props and uses native HTML. The source hooks can be kept in a thin container:

```tsx
// In the host application, with its existing hook imports:
function WalletPageContainer(
  props: Omit<WalletPageProps, 'balances' | 'prices'>,
) {
  const balances = useWalletBalances(); // must include stable id and blockchain
  const prices = usePrices();
  return <WalletPage {...props} balances={balances} prices={prices} />;
}
```

This is an explicit integration boundary, not a claim that the unseen hooks
already return the new shape. If they expose loading/error states, handle those
in the container before rendering the view. An empty successful result renders
an empty state; an unavailable token price is handled per row.

## Cost and verification

For `n` input balances and `m` retained balances, selection is `O(n)`, sorting is
typically `O(m log m)`, and display mapping is `O(m)`, with `O(m)` auxiliary space.
JavaScript does not mandate a particular sort implementation or complexity.
The refactor does not claim an asymptotic improvement: it avoids unused work,
repeated priority lookup and sorting on price-only updates.

Requires Node.js 22 LTS and npm:

```sh
cd src/problem3
npm ci
npm run typecheck
npm test
```

Tests cover filtering, descending order, equal-priority stability, immutable input,
fractional/dust formatting, unavailable versus zero prices, valuation overflow,
rendered formatted values, native div props, children and the empty state.
