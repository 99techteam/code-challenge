# Problem 3 — Messy React

## Issues and anti-patterns

### 1. The declared data type does not match the code

`WalletBalance` declares only `currency` and `amount`, but the implementation
reads `balance.blockchain`.

This is a compile-time error under normal TypeScript settings. The interface
must include `blockchain`, ideally using a finite union rather than `string`.

---

### 2. `getPriority` accepts `any`

```tsx
const getPriority = (blockchain: any): number => ...
```

`any` disables type checking and allows unsupported values to pass through.
Use a `Blockchain` union and a typed lookup table.

---

### 3. `getPriority` is recreated on every render

The function does not use component state or props, so defining it inside the
component allocates a new function every render.

Move the priority map and helper outside the component.

---

### 4. Priority is recalculated repeatedly during sorting

The comparator calls `getPriority` for both items on every comparison.
Sorting is `O(n log n)`, so the same balance priority can be recalculated many
times.

Compute each balance's priority once before sorting, then sort by the cached
value. This is a decorate-sort-undecorate pattern.

---

### 5. The filter references an undefined variable

```tsx
if (lhsPriority > -99)
```

`lhsPriority` is not defined in the filter callback. The intended variable
appears to be `balancePriority`.

This prevents the code from compiling.

---

### 6. The amount filter is probably inverted

The original filter keeps balances when:

```tsx
balance.amount <= 0
```

A wallet list normally displays positive balances and excludes zero or
negative balances. The intended condition is likely:

```tsx
balance.amount > 0
```

The refactor also rejects non-finite amounts.

---

### 7. A magic sentinel value is used

`-99` is used to mean "unsupported blockchain". Magic values make the logic
harder to understand and easier to break.

A typed set of supported blockchains removes the need for this sentinel.
Another valid design would return `null` for unsupported chains.

---

### 8. The sort comparator does not return `0`

When priorities are equal, the comparator returns `undefined`.

A comparator should always return a number. Returning `0` preserves equality;
a secondary currency comparison can also provide deterministic ordering.

---

### 9. The `useMemo` dependency list is wrong

The sorted list does not use `prices`, but `prices` is included:

```tsx
[balances, prices]
```

This causes unnecessary re-sorting whenever prices change.

In the refactor, sorting, formatting, and USD calculation are deliberately
combined into one memoized derivation, so both dependencies are genuinely used.

---

### 10. `formattedBalances` is calculated and then ignored

The code creates:

```tsx
const formattedBalances = ...
```

but maps `sortedBalances` when rendering.

This wastes one full `O(n)` pass and means the `formatted` value is never
actually used.

---

### 11. The render map lies to TypeScript

```tsx
sortedBalances.map((balance: FormattedWalletBalance) => ...)
```

Elements of `sortedBalances` are `WalletBalance`, not
`FormattedWalletBalance`. Adding a callback parameter annotation does not
transform the data.

Consequently, `balance.formatted` is missing and will be `undefined` at
runtime even if the type error is suppressed.

---

### 12. Derived work runs in separate passes

The original code performs:

1. filter;
2. sort;
3. formatting map;
4. render map;
5. USD calculation during render.

Some passes are necessary, but the unused formatting pass is pure waste.
The refactor creates one memoized display model and keeps JSX rendering simple.

---

### 13. Missing prices can produce `NaN`

```tsx
prices[balance.currency] * balance.amount
```

If no price exists for a currency, the result is `NaN`.

The refactor uses:

```tsx
const price = prices[balance.currency] ?? 0;
```

A production UI might instead omit the row or display an unavailable-price
state, depending on product requirements.

---

### 14. Array indexes are used as React keys

```tsx
key={index}
```

After filtering or sorting, indexes can refer to different balances. React may
reuse the wrong component instance and preserve incorrect local state.

Use a stable identity such as:

```tsx
key={`${balance.blockchain}:${balance.currency}`}
```

A backend-provided wallet-balance ID would be even better.

---

### 15. `children` is removed and never rendered

```tsx
const { children, ...rest } = props;
```

The component silently discards `children`.

Either do not accept/destructure children or render them intentionally.

---

### 16. `BoxProps` are spread onto a plain `div`

If `BoxProps` comes from Material UI, it may contain props such as `sx` that
are meaningful to `<Box>` but invalid on a native `<div>`.

The refactor renders `<Box {...boxProps}>`.

---

### 17. `React.FC<Props>` plus `(props: Props)` is redundant

Both annotate the same props type. A plain function is simpler and avoids
unnecessary `React.FC` semantics:

```tsx
function WalletPage(props: Props) { ... }
```

---

### 18. The empty `Props` interface adds no value

```tsx
interface Props extends BoxProps {}
```

When no additional fields are needed, a type alias is clearer:

```tsx
type Props = BoxProps;
```

The refactor keeps an interface only because it explicitly documents
`children`; a type alias would also be valid.

---

### 19. `toFixed()` has an implicit precision

Calling `toFixed()` without an argument rounds to zero decimal places. That is
usually inappropriate for token balances and may hide meaningful fractional
amounts.

Use an explicit precision or `Intl.NumberFormat`.

---

### 20. Formatting and USD calculations are mixed into rendering

Keeping calculation logic inside JSX makes rendering harder to read and test.

The refactor prepares a typed `DisplayWalletBalance` model before JSX.

---

## Complexity

Let `n` be the number of balances.

Original intended complexity:

```text
filter: O(n)
sort: O(n log n), with repeated priority calls
unused formatting: O(n)
render mapping: O(n)
```

Refactored complexity remains asymptotically `O(n log n)` because ordering
requires sorting, but it:

- computes each priority once;
- removes the unused formatting pass;
- moves display calculations out of JSX;
- avoids unnecessary re-sorting dependencies;
- produces stable keys and valid types.

## Refactored source

See:

```text
WalletPage.refactored.tsx
```

The exact imports for `useWalletBalances`, `usePrices`, `WalletRow`, and
`classes` should be added according to the skeletal repository's existing
project structure.
