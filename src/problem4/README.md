# Problem 4 — Three Ways to Sum to N (TypeScript)

Three idiomatic implementations of `sum_to_n(n)`.

| File             | Approach                            | Time     | Space    | When to use                                          |
| ---------------- | ----------------------------------- | -------- | -------- | ---------------------------------------------------- |
| `sumToN_iter`    | iterative accumulator               | **O(n)** | **O(1)** | clearest implementation; fine for any reasonable `n` |
| `sumToN_formula` | closed-form Gauss `n*(n+1)/2`       | **O(1)** | **O(1)** | best — always prefer in production                   |
| `sumToN_reduce`  | functional `Array.from(...).reduce` | **O(n)** | **O(n)** | composable but allocates; demonstrative              |

All three handle:

- `n = 0` → `0`
- positive `n`
- **negative `n`** (sums `-1 + -2 + … + n`)
- non-integer / `NaN` input → `TypeError`

The closed-form implementation also guards against `n` large enough that
`n * (n+1)` would exceed `Number.MAX_SAFE_INTEGER`, throwing `RangeError`
instead of returning a silently wrong number.

## Run

```bash
pnpm install
pnpm test          # vitest run
pnpm typecheck     # tsc --noEmit
```

## Notes

- Source: `sum_to_n.ts`
- Tests : `sum_to_n.test.ts` — parametric, asserts all three impls agree on a battery of inputs
- The three impls are exported as named exports so a consumer can pick whichever
  suits their constraints.
