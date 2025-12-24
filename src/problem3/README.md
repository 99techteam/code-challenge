# Problem 3: Code Analysis – Computational Inefficiencies & Anti-Patterns

## Executive Summary

This document analyzes a React + TypeScript `WalletPage` component and identifies **critical correctness bugs, performance inefficiencies, and React anti-patterns**.

The original implementation contains **multiple runtime-breaking errors**, incorrect memoization, broken filtering logic, and violations of React and TypeScript best practices.

A fully refactored solution is provided that:

- Fixes all runtime errors
- Restores type safety
- Eliminates redundant computation
- Applies idiomatic React Hooks patterns
- Improves maintainability and predictability

---

## Issues Summary

| #   | Issue                                  | Severity    | Impact                |
| --- | -------------------------------------- | ----------- | --------------------- |
| 1   | Undefined variable usage               | 🔴 Critical | Runtime crash         |
| 2   | Inverted filter logic                  | 🔴 Critical | Incorrect UI data     |
| 3   | Missing return in sort comparator      | 🔴 Critical | Unstable sorting      |
| 4   | Missing `blockchain` in interface      | 🔴 Critical | Type mismatch         |
| 5   | Array mutation via `sort()`            | 🔴 Critical | State corruption risk |
| 6   | Redundant iterations                   | 🟡 High     | Unnecessary CPU work  |
| 7   | Incorrect `useMemo` dependencies       | 🟡 High     | Re-renders            |
| 8   | Function recreated every render        | 🟡 High     | Memo invalidation     |
| 9   | Index used as React key                | 🟡 High     | Broken reconciliation |
| 10  | Dead / unused computed data            | 🟡 High     | Wasted computation    |
| 11  | `any` type usage                       | 🟢 Medium   | No type safety        |
| 12  | Type mismatch in mapping               | 🟢 Medium   | Runtime bugs          |
| 13  | Missing external reference (`classes`) | 🟢 Medium   | Runtime error         |
| 14  | Formatting logic inside render         | 🟢 Medium   | Slower renders        |
| 15  | Non-semantic HTML                      | 🟢 Low      | Accessibility         |

## Critical Issues (Application-Breaking)

### 1. Undefined Variable Usage

**Problem**

```ts
if (lhsPriority > -99) { ... }
```

`lhsPriority` is never defined.

**Impact**

- Immediate `ReferenceError`
- Application crashes at runtime

**Correct Fix**

```ts
const balancePriority = getPriority(balance.blockchain);
if (balancePriority > -99) { ... }
```

---

### 2. Inverted Filter Logic

**Problem**
The filter keeps invalid balances and removes valid ones.

```ts
if (balance.amount <= 0) return true;
```

**Impact**

- Displays empty or invalid wallets
- Hides valid balances

**Correct Fix**

```ts
return priority > -99 && balance.amount > 0;
```

---

### 3. Missing Return Value in Sort Comparator

**Problem**

```ts
.sort((lhs, rhs) => { if (a > b) return -1; else  if (b > a) return  1; // missing return 0 });
```

**Impact**

- Comparator may return `undefined`
- Sorting becomes unstable and unpredictable

**Correct Fix**

```ts
.sort((a, b) => b.priority - a.priority);
```

---

### 4. Missing Interface Property

**Problem**
`blockchain` is used but not declared on `WalletBalance`.

**Impact**

- TypeScript lies about data shape
- Runtime failures are possible

**Correct Fix**

```ts
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}
```

---

## Performance & Computational Inefficiencies

### 5. Array Mutation via `sort()`

**Problem**

```ts
balances.filter(...).sort(...)
```

`sort()` mutates the array in place.

**Impact**

- Mutates external state
- Breaks React’s immutability assumptions

**Fix**

- Sort only derived data
- Never mutate hook return values

---

### 6. Redundant Iterations

**Problem**

- `sortedBalances.map(...)` executed twice
- One result is never used

**Impact**

- Unnecessary O(n) cost
- Dead code

**Fix**

- Single transformation pipeline

---

### 7. Incorrect `useMemo` Dependencies

**Problem**

```ts
useMemo(..., [balances, prices]);
```

`prices` is not used in the memoized computation.
**Impact**

- Memo invalidated unnecessarily
- Extra recomputation

**Fix**

```ts
useMemo(..., [balances]);
```

---

### 8. Function Recreated Every Render

**Problem**

`getPriority` defined inside component.

**Impact**

- New function instance every render
- Breaks referential equality
- Reduces memoization effectiveness

**Fix**

- Move function outside component
- Or replace with lookup table

---

## React Anti-Patterns

### 9. Index Used as React Key

**Problem**

```ts
key = { index };
```

**Impact**

- React reuses wrong components
- Visual and state bugs on reordering

**Fix**

```ts
key={`${currency}-${blockchain}`}
```

---

### 10. Formatting Logic Inside Render

**Problem**
Formatting numbers during render.

**Impact**

- Slower renders at scale
- Harder to test

**Fix**

- Precompute formatting in `useMemo`

---

## Type Safety Issues

### 11. `any` Usage

**Problem**

```ts
(blockchain: any)
```

**Impact**

- No autocomplete
- No compiler protection

**Fix**

- Use union or string literal types

---

### 12. Type Mismatch During Mapping

**Problem**

Treating `WalletBalance` as `FormattedWalletBalance`.

**Impact**

- Accessing properties that do not exist
- Runtime bugs

---

## Refactored Solution (Summary)

The refactored version introduces:

- Explicit blockchain union types
- Priority lookup table (O(1))
- Single memoized transformation pipeline
- Stable React keys
- Semantic HTML
- No mutation of source data
- Clear separation between data and UI

---

## Performance Characteristics

| Aspect               | Original | Refactored |
| -------------------- | -------- | ---------- |
| Runtime errors       | ❌       | ✅         |
| Array mutation       | ❌       | ✅         |
| Redundant passes     | ❌       | ✅         |
| Memo correctness     | ❌       | ✅         |
| Type safety          | ❌       | ✅         |
| React best practices | ❌       | ✅         |

## Key Takeaways

- **Correctness comes before optimization**
- `useMemo` is for data, not JSX
- Never mutate hook return values
- Stable keys are non-optional
- TypeScript should prevent bugs, not hide them

---

## Conclusion

The original implementation demonstrates **common but serious React mistakes**:  
incorrect memoization, broken logic, unsafe typing, and mutation.

The refactored solution follows **idiomatic React + TypeScript patterns** and is  
safe, predictable, and scalable.
