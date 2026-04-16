# Problem 4: Three Ways to Sum to n

This folder provides three unique TypeScript implementations of `sum_to_n`.

## Implementations

- `sum_to_n_a`: iterative loop, simple and explicit, `O(|n|)` time and `O(1)` space.
- `sum_to_n_b`: arithmetic-series formula, fastest option at `O(1)` time and `O(1)` space.
- `sum_to_n_c`: recursive implementation, valid but less efficient because it uses `O(|n|)` stack space.

For negative numbers, the functions sum from `0` down to `n` so the behavior stays deterministic for any integer input.

## Test

```bash
cd src/problem4
npm install
npm test
```
