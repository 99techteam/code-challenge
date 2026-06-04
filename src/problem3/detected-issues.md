# Problem 3 Review: Original vs Refactored

This note compares `original.tsx` with the current `refactored.tsx`.

## Verdict

The refactored version is materially better than the original.

It fixes the main correctness and maintainability problems from the original implementation:

- no more runtime crash from `lhsPriority`
- filtering logic is corrected to keep supported chains with positive balances
- `blockchain` is now present on `WalletBalance`
- priority lookup is moved out of render logic
- sorting is deterministic
- list keys are more stable
- missing price data no longer produces `NaN`
- `children` is rendered again

The remaining issues are minor and mostly about surrounding project context, not the core refactor itself.

## Original Issues

### 1. Undefined variable caused a runtime crash

In `original.tsx`, the filter callback computed `balancePriority` but then checked `lhsPriority`, which was never defined.

Impact:

- the component could crash at runtime before rendering rows

Status in refactor:

- fixed

### 2. Filter logic was inverted

The original code kept balances with `amount <= 0`, which is the opposite of expected wallet behavior.

Impact:

- positive balances were excluded
- empty or negative balances were rendered instead

Status in refactor:

- fixed by filtering for supported chains with `amount > 0`

### 3. `WalletBalance` type did not match usage

The original type only declared:

- `currency`
- `amount`

but the implementation read `balance.blockchain` in both filter and sort.

Impact:

- type definition and runtime usage were inconsistent

Status in refactor:

- fixed by adding `blockchain: string`

### 4. `getPriority` was weakly typed and recreated on every render

The original implementation used `any` and declared the helper inside the component.

Impact:

- weaker type safety
- unnecessary function recreation

Status in refactor:

- fixed by moving a typed helper to module scope

### 5. Sort comparator was incomplete

The original comparator returned `-1` or `1`, but returned `undefined` when priorities were equal.

Impact:

- sort behavior was not fully defined

Status in refactor:

- fixed with a numeric comparator

### 6. Derived formatted data was unused

The original code created `formattedBalances` but rendered rows from `sortedBalances`.

Impact:

- extra computation
- the `formatted` field was never actually consumed correctly

Status in refactor:

- fixed by formatting directly when rendering rows

### 7. Row typing and mapped data did not match

The original `rows` mapping annotated items as `FormattedWalletBalance`, even though the array being mapped was still `sortedBalances`.

Impact:

- logic and type intent diverged

Status in refactor:

- fixed

### 8. `index` was used as the React key

The original code used `key={index}` in a sorted list.

Impact:

- React reconciliation could break when order changed

Status in refactor:

- improved by switching to a composite key from `blockchain` and `currency`

### 9. `children` was destructured but never rendered

Impact:

- component API and behavior were inconsistent

Status in refactor:

- fixed

## Refactored Version Review

## What is good now

### 1. Core behavior is now coherent

The current refactor:

- filters valid balances
- sorts by chain priority
- computes USD value defensively
- formats output consistently

That is the biggest improvement over the original.

### 2. Helper extraction is cleaner

`BLOCKCHAIN_PRIORITY`, `LOWEST_PRIORITY`, `getPriority`, and `formatBalanceAmount` are now outside the component, which makes the render logic smaller and easier to read.

### 3. Types are more honest

Using `blockchain: string` is better than pretending the hook can only return a closed set of chain names.

### 4. The render path is simpler

The component now has two clear derived values:

- `sortedBalances`
- `rows`

That is easier to maintain than the original mixture of broken formatting and mismatched mapping.

## Remaining concerns

### 1. `BoxProps` is still empty

This is not wrong, but it currently adds no value.

Suggestion:

- remove it if the surrounding project does not need it
- keep it only if it matches an external shared component contract

### 2. Price lookup still depends on external hook shape

`prices[balance.currency] ?? 0` is safe, but the file still assumes `usePrices()` returns a dictionary keyed by currency.

Suggestion:

- if this code is part of a real project, define an explicit `Prices` type for the hook result

### 3. Key uniqueness depends on domain assumptions

`key={`${balance.blockchain}:${balance.currency}`}` is much better than `index`, but it still assumes that pair is unique.

Suggestion:

- keep it if the data model guarantees uniqueness
- otherwise use a real stable id if one exists

## Conclusion

Compared with the original, the current refactored version is a good rewrite.

It is not just cleaner stylistically; it also fixes the important behavior bugs. If this were a review, I would accept the direction of the refactor.

The only further improvements I would consider are:

- tighten the surrounding shared types
- remove `BoxProps` if unused
- verify that the composite key matches real data uniqueness rules
