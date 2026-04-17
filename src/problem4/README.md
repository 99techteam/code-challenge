# Problem 4

## Interpretation

The prompt asks for the summation from `1` to `n`.

For this implementation:

- if `n >= 1`, return `1 + 2 + ... + n`
- if `n < 1`, return `0` because the range `1..n` contains no positive integers
- if `n` is not an integer, truncate toward zero first

This keeps the contract consistent with the natural reading of "sum to n" from `1`.

## Implementations

### `sum_to_n_a`

- Strategy: iterative loop
- Time: `O(n)`
- Space: `O(1)`

### `sum_to_n_b`

- Strategy: recursion
- Time: `O(n)`
- Space: `O(n)`

### `sum_to_n_c`

- Strategy: arithmetic formula
- Time: `O(1)`
- Space: `O(1)`

## Run

From the repository root:

```bash
npm install
npm run test:problem4
```
