# Problem 1 — `sum_to_n`

Three unique implementations of a function that returns the summation to `n`,
e.g. `sum_to_n(5) === 1 + 2 + 3 + 4 + 5 === 15`.

Input `n` is any integer; the result is assumed to stay below
`Number.MAX_SAFE_INTEGER`.

## Run

```bash
node sum_to_n.js
```

A clean run prints `all checks passed`. The file contains `console.assert`
sanity checks that stay silent on success and log a message on failure.

## Negative-`n` convention

Since `n` may be any integer, the three implementations agree on the following
consistent behaviour:

| `n`  | result | meaning                              |
| ---- | ------ | ------------------------------------ |
| `5`  | `15`   | sum of `1..5`                        |
| `0`  | `0`    | empty sum                            |
| `-3` | `-6`   | sum of `-3, -2, -1` (i.e. `n..-1`)   |

## The three approaches

| Fn             | Approach                        | Time   | Space           |
| -------------- | ------------------------------- | ------ | --------------- |
| `sum_to_n_a`   | Iterative `for` loop            | `O(n)` | `O(1)`          |
| `sum_to_n_b`   | Closed-form Gauss formula       | `O(1)` | `O(1)`          |
| `sum_to_n_c`   | Recursion (functional style)    | `O(n)` | `O(n)` stack    |

### a) Iterative loop
Accumulates a running total, walking `1..n` for positive `n` or `n..-1` for
negative `n`.

### b) Closed-form (Gauss)
Uses the triangular-number identity. Important detail: the bare
`n*(n+1)/2` does **not** satisfy the negative convention — for `n = -3` it
returns `3`, not `-6`. The sum of `n..-1` for `n < 0` equals the triangular
number of `|n|`, negated. The implementation therefore uses the sign-aware
closed form:

```
sign(n) * |n| * (|n| + 1) / 2
```

which gives `15` for `n=5`, `0` for `n=0`, and `-6` for `n=-3`, all in constant
time.

### c) Recursion
Peels one term off toward `0` per call: `f(n) = n + f(n ∓ 1)`. Clear and
functional, but uses `O(n)` call-stack space.
