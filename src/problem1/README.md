# Problem 1: Three ways to sum integers

All three standalone functions use the same contract:

- Positive `n`: sum `1 + 2 + ... + n`.
- Negative `n`: sum `-1 + -2 + ... + n`.
- Zero, including `-0`: return `0`.
- Non-integers, non-numbers, `NaN` and infinities throw `TypeError`.
- `abs(n) > 134217727` throws `RangeError`: its sum would exceed
  `Number.MAX_SAFE_INTEGER`. Use a separate BigInt implementation for that range.

The negative-input convention extends the ordinary nonnegative problem and
matches the original loop implementation. There is no implicit input coercion.

| Implementation | Approach | Time | Auxiliary space |
| --- | --- | --- | --- |
| `loop.js` | Accumulate one term at a time | O(abs(n)) | O(1) |
| `recursion.js` | Recursively halve the problem | O(log(abs(n) + 1)) | O(log(abs(n) + 1)) |
| `math_formula.js` | Signed triangular-number formula | O(1) | O(1) |

For recursion, let `m = floor(n / 2)` on the positive magnitude. Pair the first
half with the second half to get `S(2m) = 2*S(m) + m*m`. If the magnitude is odd,
add its last term. Only one recursive call is needed per level, so large valid
inputs do not exhaust the call stack. Apply the original sign at the end.

The formula computes `abs(n) * (abs(n) + 1) / 2` and applies the sign. Dividing
the even factor before multiplying also keeps intermediate integers safe.

The loop is intentionally linear to demonstrate a different approach; a large
valid input can still take a long time. Prefer the formula when only the total
is needed.

Run the dependency-free tests with Node.js 22 LTS from the repository root:

```sh
node --test src/problem1/sum.test.cjs
```

Tests cover positive/negative inputs, both zeros, invalid inputs, agreement over
small integers and the maximum supported magnitude. Boundary computation is
tested on recursion and formula; the linear loop is not run 134 million times.
