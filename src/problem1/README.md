# Problem 1 — Three ways to sum to n

Three implementations of `sum_to_n(n)` using genuinely different strategies:

| | Approach | Time | Space |
|--|----------|------|-------|
| A | Iterative `for` loop | O(n) | O(1) |
| B | Gauss closed form `n*(n+1)/2` | **O(1)** | O(1) |
| C | `Array.from + reduce` | O(n) | O(n) |

Implementation B is the practical choice for any real code because it runs in constant
time regardless of `n`. Implementation C trades memory for a more functional style that
composes naturally with additional sequence transforms. All three return `0` for `n ≤ 0`
(empty sum), which the problem leaves as an assumption since only positive examples are
given.

