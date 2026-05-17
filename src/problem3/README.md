# Problem 3 — Messy React

Analysis of `Original.tsx` and a refactor in `WalletPage.tsx`.

The original component has six **bugs that prevent it from working as intended**, plus a number of TypeScript, performance, and React anti-pattern issues. The bugs are listed first because they are the highest-impact: most of the "performance" complaints are moot when the code can't even run.

---

## 1. Bugs (correctness)

### 1.1 `lhsPriority` is undefined inside the filter callback
```ts
const balancePriority = getPriority(balance.blockchain);
if (lhsPriority > -99) { ... }   // ← lhsPriority is not defined
```
The local is `balancePriority`, but the condition references `lhsPriority`. In TypeScript-strict this is a compile error; at runtime it's a `ReferenceError`. The filter never runs successfully.

**Fix:** rename to `balancePriority` (or, as in the refactor, replace the `> -99` sentinel check with an explicit `isKnownBlockchain` type guard).

### 1.2 Filter logic is inverted
```ts
if (balance.amount <= 0) {
  return true;     // ← keeps zero/negative balances
}
return false;      // ← drops positive balances
```
A wallet page is supposed to show **positive** balances. The condition is the wrong way around.

**Fix:** `b.amount > 0`.

### 1.3 `balance.blockchain` is not declared on `WalletBalance`
```ts
interface WalletBalance {
  currency: string;
  amount: number;
  // no `blockchain` field, yet the code does `balance.blockchain` everywhere
}
```
TypeScript would have caught this — except `getPriority` declares its parameter as `any`, which leaks `any` back through the call site and disables the check.

**Fix:** add `blockchain: Blockchain` to `WalletBalance` and type `getPriority` properly.

### 1.4 Sort comparator has no return for equal priorities
```ts
if (leftPriority > rightPriority) return -1;
else if (rightPriority > leftPriority) return 1;
// equal case falls through → returns undefined
```
`Array.prototype.sort` coerces `undefined` to `0`-ish but the behavior is implementation-defined and produces unstable ordering when many items share a priority (Zilliqa and Neo here both return 20).

**Fix:** return `0`, or just use `a.priority - b.priority`.

### 1.5 `formattedBalances` is computed but never used
The `rows` map iterates over `sortedBalances`, not `formattedBalances`. The element is then cast as `FormattedWalletBalance`, which is a lie — `sortedBalances` is `WalletBalance[]`, so `balance.formatted` is always `undefined`. The unsound `as`-cast is the only reason TypeScript doesn't complain.

**Fix:** iterate over `formattedBalances`, or merge the formatting into a single pass.

### 1.6 `amount.toFixed()` drops all precision
With no argument `toFixed` defaults to `0` decimals — `1.9999.toFixed()` becomes `"2"`. Almost certainly not the intent for a wallet UI.

**Fix:** pick a sensible precision such as `toFixed(4)`, or use `Intl.NumberFormat` for locale-aware grouping.

---

## 2. TypeScript issues

### 2.1 Empty `interface Props extends BoxProps`
Adds nothing — just use `BoxProps` directly (or `type WalletPageProps = BoxProps`).

### 2.2 Redundant typing on the component
`React.FC<Props>` already types `props`. Writing `(props: Props)` on top is redundant.

### 2.3 `blockchain: any` defeats the type system
The `any` cast on `getPriority` is what allowed bug 1.3 to slip in. Type it as `Blockchain` (a string-literal union) or `string` if the lookup tolerates unknown inputs.

### 2.4 Unsound cast `(balance: FormattedWalletBalance)` in the row map
`sortedBalances` is `WalletBalance[]`. The cast hides the missing `.formatted` field at compile time, which is how bug 1.5 stayed invisible.

---

## 3. Performance / React anti-patterns

### 3.1 `getPriority` redefined every render
The switch is pure static data. Hoisting to module scope (or replacing with a `Record<Blockchain, number>`) removes the per-render allocation and lets TypeScript prove exhaustiveness against the union.

### 3.2 `prices` listed in `useMemo` deps but unused in the body
The memo computes a sorted list from `balances` only — `prices` is not referenced inside. Including it in the deps causes the (potentially expensive) sort to re-run on every price tick for no reason. Common in trading UIs where prices update every second.

**Fix:** drop `prices` from the deps; if you also want USD values memoized, put them in a separate memo with `[sortedBalances, prices]` so a price tick only re-runs the cheap formatting step.

### 3.3 `getPriority` called twice per comparison in the sort
The comparator calls `getPriority` for both sides every time it fires, so the function runs ~2·N·log N times per sort. With a static lookup this is fine in absolute terms, but the canonical fix — the *decorate-sort-undecorate* (Schwartzian) pattern — is one line and makes the intent obvious.

**Fix:** map to `{ balance, priority }`, sort by `priority`, then unwrap.

### 3.4 `formattedBalances` is not memoized
Even if it were used, it gets recomputed on every render — including renders triggered by unrelated state. Wrap in `useMemo` with `[sortedBalances]`.

### 3.5 `key={index}` is the wrong key
React keys must be stable identifiers of the item, not of its position. The list here is filtered + sorted, so the same balance will land at different indices across renders, and React will reuse the wrong DOM nodes (carrying focus, animation state, etc. across rows). Use a stable id like `${blockchain}:${currency}`.

### 3.6 Several passes over `balances` that can be combined
filter → sort → map (formattedBalances) → map (rows). Combining the filter+sort+format into a single pipeline reduces allocations and makes the data flow easier to follow. (Whether to split filtering and formatting into two memos is a deliberate trade-off — see 3.2.)

### 3.7 No null/undefined safety on `prices[balance.currency]`
If a token has no price, `prices[currency]` is `undefined`, and `undefined * amount` is `NaN`. The UI then renders `$NaN`.

**Fix:** `(prices[currency] ?? 0) * amount`, or skip the row entirely.

---

## 4. Smaller issues

- **Magic `-99` sentinel.** Use `Number.NEGATIVE_INFINITY`, or — cleaner — a type guard like `isKnownBlockchain` so the filter expresses intent directly.
- **`children` destructured but never rendered.** Either render `{children}` (as in the refactor) or remove the destructure.
- **Mixed indentation.** Tabs and 2-space spaces interleaved in the original. A formatter (Prettier) would silence this.

---

## 5. Refactor summary

`WalletPage.tsx` applies the fixes above:

| Concern              | Before                                | After                                                          |
| -------------------- | ------------------------------------- | -------------------------------------------------------------- |
| Filter bug           | wrong variable, inverted predicate    | `isKnownBlockchain(b.blockchain) && b.amount > 0`              |
| Sort                 | if/else, missing equal case           | `b.priority - a.priority`                                      |
| Priority lookup      | function redefined per render         | module-scope `Record<Blockchain, number>`                      |
| Priority calls/sort  | 2·N·log N                             | N (decorate-sort-undecorate)                                   |
| Memo deps            | `[balances, prices]` (over-triggered) | `[balances]` for sort, `[sortedBalances, prices]` for format   |
| Types                | `any`, empty `Props`, unsound cast    | `Blockchain` union, `WalletPageProps = BoxProps`, inferred map |
| Key                  | `index`                               | `${blockchain}:${currency}`                                    |
| Missing price        | `NaN` USD                             | `(prices[currency] ?? 0)`                                      |
| `.toFixed()`         | 0 decimals                            | `toFixed(4)`                                                   |
| `children`           | destructured, dropped                 | rendered                                                       |
