# Problem 1 — Three Ways to Sum to N

## Task

Provide three unique implementations of `sum_to_n` that each return `1 + 2 + … + n`.

**Input:** `n` — any integer  
**Output:** summation to `n`, i.e. `sum_to_n(5) === 1 + 2 + 3 + 4 + 5 === 15`

When `n ≤ 0`, the result is `0`.

## Implementations

| Variant | Approach | Time Complexity | Space Complexity |
|---------|----------|-----------------|------------------|
| **A** | Iterative loop | O(n) | O(1) |
| **B** | Gauss formula `n*(n+1)/2` | O(1) | O(1) |
| **C** | Recursion | O(n) | O(n) — call stack |

### A — Iterative

Simple `for` loop accumulating the sum. Straightforward, no risk of stack overflow.

### B — Mathematical (Gauss)

Uses the closed-form formula. Constant time — the most efficient approach. Works correctly for all integer values within JavaScript's safe integer range.

### C — Recursive

Each call adds `n` and recurses with `n - 1`. Elegant but limited by the call stack depth (~10 000 in most JS engines). Included to demonstrate a different algorithmic pattern.

## Examples

```
sum_to_n(5)  → 15
sum_to_n(1)  → 1
sum_to_n(0)  → 0
sum_to_n(-3) → 0
```

## Solution

Code: [`sum.js`](./sum.js) — exports `sum_to_n_a`, `sum_to_n_b`, `sum_to_n_c`.
