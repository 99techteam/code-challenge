# Problem 3 — Messy React (Code Review & Refactor)

## Task

Identify computational inefficiencies and anti-patterns in the given React/TypeScript code, then provide a clean refactored version.

## Files

| File | Purpose |
|------|---------|
| `ANALYSIS.md` | Detailed list of **13 issues** found, categorized by Bug / Performance / Type / Anti-pattern, with explanations and fixes |
| `WalletPage.refactored.tsx` | Cleaned-up version of the component with all issues resolved |

## Issues found (summary)

| # | Category | Issue | Severity |
|---|----------|-------|----------|
| 1 | **Bug** | `lhsPriority` used instead of `balancePriority` — filter always returns empty | Critical |
| 2 | **Bug** | Filter logic inverted — keeps amount ≤ 0, drops positive balances | Critical |
| 3 | **Type** | `WalletBalance` missing `blockchain` property used in code | High |
| 4 | **Bug** | Sort comparator returns `undefined` when priorities equal | Medium |
| 5 | **Perf** | `prices` in `useMemo` deps but not used in computation | Medium |
| 6 | **Bug** | `formattedBalances` computed but never used; rows use raw `sortedBalances` | High |
| 7 | **Anti-pattern** | `key={index}` on sorted/filtered list | Medium |
| 8 | **Perf** | `getPriority` recreated every render (pure fn inside component) | Low |
| 9 | **Type** | `blockchain: any` loses type safety | Low |
| 10 | **Robustness** | `prices[currency]` may be `undefined` → `NaN` | Medium |
| 11 | **Style** | Empty `Props extends BoxProps` adds noise | Low |
| 12 | **Logic** | `children` destructured but never rendered | Low |
| 13 | **Missing** | `classes.row` used but `classes` never defined | Medium |

## Key improvements in refactored code

1. **Correct filter**: `balancePriority > -99 && balance.amount > 0`
2. **Stable sort**: `rightPriority - leftPriority` (returns `0` for equal)
3. **Proper deps**: `useMemo` only depends on `[balances]`, not `prices`
4. **Uses `formattedBalances`** to render rows (not `sortedBalances`)
5. **Stable keys**: `${blockchain}-${currency}-${amount}` instead of array index
6. **`getPriority` outside component**: pure function, no re-creation
7. **Typed `Blockchain`**: union type instead of `any`
8. **Safe price access**: `(prices[currency] ?? 0)` prevents `NaN`
9. **All derived data memoized**: `sortedBalances` → `formattedBalances` → `rows`

See `ANALYSIS.md` for the full detailed explanation of each issue.
