# Problem 1 — `sum_to_n`

Three implementations of `sum_to_n(n)` that return `1 + 2 + ... + n`.

## Requirements

- [Node.js](https://nodejs.org/) (any recent LTS version — no dependencies required)

## Run

From the repository root:

```bash
node src/problem1/index.js
```

You should see:

```
sum_to_n_a(5)   = 15
sum_to_n_b(100) = 5050
sum_to_n_c(10)  = 55
```

## Try it yourself

Open a Node REPL and import the functions:

```bash
node
```

```js
const { sum_to_n_a, sum_to_n_b, sum_to_n_c } = require('./src/problem1/index.js');

sum_to_n_a(5);    // 15  — iterative for-loop
sum_to_n_b(100);  // 5050 — Gauss closed-form formula
sum_to_n_c(10);   // 55  — recursion
```

## Implementations

| Function       | Approach                          | Time | Space | Notes                                          |
| -------------- | --------------------------------- | ---- | ----- | ---------------------------------------------- |
| `sum_to_n_a`   | Iterative `for` loop              | O(n) | O(1)  | Simple and predictable.                        |
| `sum_to_n_b`   | Closed-form formula `n*(n+1)/2`   | O(1) | O(1)  | Fastest; no iteration.                         |
| `sum_to_n_c`   | Recursion `n + sum_to_n_c(n - 1)` | O(n) | O(n)  | Elegant, but risks stack overflow for large n. |

## Assumptions

- `n` is a positive integer (`n > 0`).
- The result is always less than `Number.MAX_SAFE_INTEGER`.
