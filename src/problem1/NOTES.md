# Problem 1 — Notes

Three implementations of `sum_to_n`, in [`src/index.ts`](./src/index.ts).

## Approach

| Function     | Idea                                                                 | Time     | Space (stack) |
| ------------ | -------------------------------------------------------------------- | -------- | ------------- |
| `sum_to_n_a` | Gauss's formula `n(n + 1) / 2`                                       | O(1)     | O(1)          |
| `sum_to_n_b` | Loop adding `1..n`                                                   | O(n)     | O(1)          |
| `sum_to_n_c` | Recursive halving: `S(2k) = 2·S(k) + k²`, `S(2k+1) = S(2k) + 2k + 1` | O(log n) | O(log n)      |

`sum_to_n_a` is the one to use in practice. `sum_to_n_b` is the plainest reading of the
definition. `sum_to_n_c` is a recursive approach that stays safe for large `n`.

## Edge cases

- **Negative `n`** — "any integer" includes negatives, and the problem doesn't say what they
  mean. Here, `n < 0` sums `n..-1`, so `sum_to_n(-n) === -sum_to_n(n)`. `sum_to_n(0)` is `0`.
- **Largest input** — `n = 134217727` gives `2^53 − 2^26`, the largest sum that is still a
  safe integer. All three return the exact value. `sum_to_n_a` halves the even factor
  before it multiplies, so no intermediate value is larger than the result.
- **Non-integer input** (`1.5`, `NaN`, `±Infinity`) — throws `RangeError`. Without this
  check, `NaN` would return `0` from the loop and `NaN` from the formula.
- **Cross-check** — every implementation is compared with a brute-force reference for
  every `n` in `-200..200`.

## Trade-offs

- **No naive recursion.** `n + sum(n − 1)` is the usual third answer. It overflows the call
  stack after about 10k frames, well before the largest allowed `n` (about 1.3 × 10⁸).
  Recursive halving stays recursive and needs fewer than 60 frames.
- **No `Array.from(...).reduce`.** It allocates an array of `n` elements, which is about
  1 GB at the largest `n`. It gives the same result as the loop with worse memory use.
- **No `BigInt`.** The problem guarantees the result is a safe integer, so `number` is
  enough and matches the given signature.
