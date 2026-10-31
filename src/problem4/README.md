# Problem 4: Sum from 1 to n

This solution implements three ways to calculate the sum of the integers from `1` through `n`:

```text
1 + 2 + ... + n
```

For `n <= 0`, each function returns `0`. The intended input is a non-negative integer.

## Implementations

| Function | Method | Time | Extra space |
| --- | --- | --- | --- |
| `sum_to_n_a` | Iterative loop | `O(n)` | `O(1)` |
| `sum_to_n_b` | Recursion | `O(n)` | `O(n)` call stack |
| `sum_to_n_c` | Arithmetic-series formula | `O(1)` | `O(1)` |

The formula implementation divides the even factor before multiplying. JavaScript numbers still have a finite exact-integer range, so results are exact only while they remain within `Number.MAX_SAFE_INTEGER`.

## Run

From the repository root, run the TypeScript file with `tsx`:

```sh
npx tsx src/problem4/solution.ts
```

The current file calls each implementation with `5`; each prints `15`:

```text
15
15
15
```

To try another value, change the arguments in the three `console.log` calls at the bottom of `solution.ts`.
