# Code Challenge: Problems 1, 2 and 3

This directory contains three solutions: an algorithm exercise, an interactive
currency swap form, and a React code review with a refactored implementation.

## Requirements

- Node.js 22 LTS and npm.
- Problem 1 has no external dependencies.
- Problems 2 and 3 have separate packages. Install dependencies in each folder.
- Problem 2 requires internet access to fetch reference prices and token icons.

All commands below start from the **repository root** unless stated otherwise.

## Problem 1: Three Ways to Sum Integers

### Objective

Implement three functions that calculate the sum from 1 to a positive integer
`n`. The solutions also support negative integers using the convention of summing
from -1 down to `n`.

```text
n = 5   ->  15
n = 0   ->   0
n = -5  -> -15
```

### Approach

| File | Function | Method | Time | Auxiliary space |
| --- | --- | --- | --- | --- |
| [loop.js](./problem1/loop.js) | `sum_to_n_a` | Accumulate each term in a loop | O(abs(n)) | O(1) |
| [recursion.js](./problem1/recursion.js) | `sum_to_n_b` | Recursively halve the problem | O(log(abs(n) + 1)) | O(log(abs(n) + 1)) |
| [math_formula.js](./problem1/math_formula.js) | `sum_to_n_c` | Signed triangular-number formula | O(1) | O(1) |

The recursive version uses `S(2m) = 2*S(m) + m*m`, adding the final term for an
odd magnitude. This avoids the linear call-stack depth of decrementing `n` one
step at a time. The formula computes `abs(n) * (abs(n) + 1) / 2` and applies the
original sign, dividing the even factor first to keep intermediate integers safe.

All implementations reject non-integer inputs with `TypeError`. Inputs with
`abs(n) > 134217727` throw `RangeError` because the sum exceeds JavaScript's safe
integer range. The loop remains linear and can be slow for large valid inputs;
the formula is the preferred method when only the total is needed.

### Run Tests

```sh
node --test src/problem1/sum.test.cjs
```

Tests cover positive and negative inputs, zero, invalid inputs, consistency
between implementations, and the safe boundary for recursion and the formula.

Further explanation: [Problem 1 README](./problem1/README.md).

## Problem 2: Fancy Form

### Objective

Build an intuitive, visually polished currency swap form. The application,
**Flux**, uses React, TypeScript and Vite, with a responsive dark interface,
rounded controls and a red-pink accent inspired by the supplied design reference.

### Features

- Search and select tokens by name or symbol.
- Enter an amount and calculate the estimated receive amount and USD value.
- Reverse the token pair while preserving the entered amount.
- Show validation when both sides use the same token without silently changing
  either selection.
- Review and confirm a simulated swap in a lightweight modal.
- Handle loading, request failures, explicit Retry and missing token icons.
- Support keyboard navigation, dialog focus management and mobile layouts.

### Data and Calculation

Prices are fetched once from the
[interview API](https://interview.switcheo.com/prices.json). Only tokens with valid,
finite, positive prices are available in the picker. Duplicate symbols use the
newest timestamp, with the last record winning a timestamp tie.

```text
exchange rate = source USD price / destination USD price
receive amount = send amount * exchange rate
```

Calculations use `decimal.js`. User input remains an unchanged string while
typing, including values such as `0.00` and `1.2300`. Only calculated values are
formatted, with magnitude-aware precision for small token amounts.

The API provides historical reference data, not a live market feed. The UI labels
it as reference pricing and does not poll or simulate realtime updates. This is
a frontend demo: no wallet connection, real funds or blockchain transaction is
involved.

### Architecture

- [App.tsx](./problem2/App.tsx): form state, derived quote and review flow.
- [prices.ts](./problem2/prices.ts): fetch lifecycle, timeout and Retry.
- [swap.ts](./problem2/swap.ts): normalization, validation, calculation and formatting.
- [components](./problem2/components/): amount field, token picker, icons and modal.
- [style.css](./problem2/style.css): design tokens and responsive styling.

### Run the App

```sh
cd src/problem2
npm ci
npm run dev
```

Open the local URL printed by Vite. In the same directory, run the checks and
preview the production build:

```sh
npm run typecheck
npm test
npm run build
npm run preview
```

Vitest and React Testing Library cover calculations, validation and core user
interactions. Responsive and keyboard behavior have also been reviewed in Chrome.

Further explanation: [Problem 2 README](./problem2/README.md).

## Problem 3: Messy React

### Objective

Identify correctness issues, computational inefficiencies and anti-patterns in
the supplied React/TypeScript snippet, then provide a refactored version with
clear explanations of the changes.

### Findings

The [detailed review](./problem3/README.md) explains 13 issues, including:

- An undefined `lhsPriority` variable and a missing `blockchain` field in the type.
- A nonpositive-balance filter that conflicts with a positive-holdings view.
- An unused formatted array while unformatted balances are rendered instead.
- `toFixed()` rounding fractional holdings to whole numbers by default.
- A comparator that does not explicitly return zero for equal priorities.
- An unrelated `prices` dependency causing unnecessary filtering and sorting.
- Repeated priority lookups and a component-local helper typed with `any`.
- Index keys in a list that can be filtered or reordered.
- Missing prices producing `NaN` valuations.
- Potentially incompatible Box props forwarded to a native div and discarded children.

The review distinguishes confirmed bugs from assumptions. For example, showing
only positive holdings is an explicit business choice. It also explains that
the original `filter().sort()` does **not** mutate the source array, because
`filter()` creates a new one.

### Refactored Approach

- Define a balance type with a stable position ID and blockchain information.
- Calculate each priority once, filter valid positive holdings, and sort in
  descending priority while preserving input order for ties.
- Memoize selection using only the balance array; use current prices for valuation.
- Format values during row rendering and show `Price unavailable` for missing
  or invalid prices, distinguishing them from a legitimate zero price.
- Use native div prop types and render supported children.

The repository does not include the original hooks or UI-library components.
The refactor therefore accepts balances and prices through props and uses minimal
HTML. Its README shows how to connect the existing hooks in a host application.
Problem 3 is a review and component implementation, **not a standalone browser app**.

### Files and Verification

- [WalletPage.tsx](./problem3/WalletPage.tsx): refactored React component.
- [balances.ts](./problem3/balances.ts): selection, valuation and display functions.
- [balances.test.tsx](./problem3/balances.test.tsx): focused logic and rendering tests.

```sh
cd src/problem3
npm ci
npm run typecheck
npm test
```

Tests cover filtering, sorting, stable ties, input immutability, fractional
amounts, missing and zero prices, overflow, children, div attributes and empty state.

For n input balances and m retained balances, selection is O(n), sorting is
typically O(m log m), and rendering is O(m), with O(m) auxiliary space. The
improvement is avoiding redundant work, not changing the asymptotic sorting cost.

Further explanation: [Problem 3 README](./problem3/README.md).
