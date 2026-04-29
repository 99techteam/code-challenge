# Problem 1: Three Ways to Sum to N

This solution provides three unique JavaScript implementations of `sum_to_n`.

## Files

- `solution.js`: contains all three implementations.

## Implementations

1. `sum_to_n_a`

   Iterative loop approach. It loops from `1` to `|n|`, adds each number to an accumulator, and applies the original sign of `n`.

   Complexity: `O(n)` time, `O(1)` space.

2. `sum_to_n_b`

   Mathematical approach using the Gauss formula:

   ```js
   n * (n + 1) / 2
   ```

   The implementation uses `Math.abs(n)` and reapplies the sign, so negative integers are handled consistently.

   Complexity: `O(1)` time, `O(1)` space.

3. `sum_to_n_c`

   Array reduce approach. It builds a range from `1` to `|n|`, applies the sign, then sums the values with `reduce`.

   Complexity: `O(n)` time, `O(n)` space.

## Notes

The task states that `n` can be any integer. This implementation supports:

- positive integers, for example `sum_to_n(5) === 15`
- zero, where `sum_to_n(0) === 0`
- negative integers, for example `sum_to_n(-3) === -6`

## Quick test

Open `solution.js` in a browser console or include it with a script tag. Then call:

```js
sum_to_n_a(5); // 15
sum_to_n_b(5); // 15
sum_to_n_c(5); // 15
```
