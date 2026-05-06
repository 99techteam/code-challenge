# Problem 3 - Messy React (WalletPage)

This document summarizes the issues found in the original component and the improvements applied in the refactored `WalletPage.tsx`.

## Tech Context

- React with TypeScript
- Functional components
- React Hooks (`useMemo`)

## What Was Wrong (Original Version)

### 1) Runtime and Logic Bugs

- Used an undefined variable inside filtering logic (`lhsPriority`), which can break execution.
- Filtering condition was reversed (`amount <= 0`), keeping invalid/empty balances.
- Sort comparator did not always return a number (missing equal-case handling), causing unstable ordering.
- Mapped rows from `sortedBalances` but tried to read formatted fields that were not present.
- `formattedAmount` prop mismatch (`formatted` existed in data, `formattedAmount` was read in component).
- Potential `NaN` in USD value calculation when a token price is missing.

### 2) TypeScript Anti-Patterns

- `blockchain` property used but not declared on `WalletBalance`.
- `getPriority(blockchain: any)` weakened type safety.
- Callback parameter types were inaccurate (declared as richer type than actual values).
- Empty/weak prop typing patterns and inconsistent prop contracts across components.

### 3) React / Performance Issues

- Used `index` as React key for list rows (unstable when sorting/filtering).
- Derived arrays were created in multiple passes without clear alignment of data shape.
- Memoization dependencies were previously incorrect in the old implementation.
- Unused derived data (`formattedBalances`) added unnecessary work.

## What Was Improved (Current Version)

### 1) Correctness Fixes

- Replaced broken filter/sort pipeline with correct logic:
  - Keep only supported blockchains
  - Keep only positive balances
  - Sort by descending blockchain priority
- Unified row data shape so formatted values and USD value are created before rendering.
- Added safe fallback in price lookup: `(prices[b.currency] ?? 0)`.
- Fixed row prop mismatch by using a consistent `formatted` field end-to-end.

### 2) Type Safety Improvements

- Added strict `Blockchain` union type.
- Added required `blockchain` and `id` fields to `WalletBalance`.
- Replaced weak `any` usage with typed `getPriority(blockchain: Blockchain)`.
- Introduced explicit `WalletRowData` and `WalletRowProps` interfaces for stable contracts.

### 3) React Best-Practice Improvements

- Replaced index key with stable key (`row.id`).
- Consolidated derived list creation into a single `useMemo` pipeline (`filter -> sort -> map`).
- Kept render phase focused on presentation only (`rows.map(...)` into `WalletRow`).
- Switched to direct function component props typing for clearer component contracts.

## Final Notes

- The component now has a clearer data flow: **raw balances -> validated/sorted/formatted rows -> render**.
- The current version is significantly safer and easier to reason about.
