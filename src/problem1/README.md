# Three ways to sum to n

The functions in [sum.js](sum.js) return the sum of integers from 1 through n.
For zero or negative integers, that range is empty and the result is 0.
Non-integers and inputs whose positive sum exceeds the safe integer range are rejected.

| Implementation | Approach | Time | Extra space |
| --- | --- | --- | --- |
| `sum_to_n_a` | Accumulate in a loop | O(n) | O(1) |
| `sum_to_n_b` | Arithmetic series formula | O(1) | O(1) |
| `sum_to_n_c` | Divide the range into halves recursively | O(n) | O(log n) stack |

The formula is the practical choice. Dividing the even factor before multiplying
avoids an unnecessarily large intermediate product. Divide-and-conquer demonstrates
recursion without the O(n) call depth of a linear recursive implementation; it still
does more work than the loop. Large valid inputs are supported but are deliberately
not benchmarked with the O(n) versions in the test suite.

Run `bun test src/problem1` from the repository root.
