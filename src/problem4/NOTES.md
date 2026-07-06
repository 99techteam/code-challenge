# Complexity Notes

| Function     | Time | Space |
|--------------|------|-------|
| sum_to_n_a   | O(1) | O(1)  |
| sum_to_n_b   | O(n) | O(1)  |
| sum_to_n_c   | O(n) | O(n)  |

- **a** — closed-form arithmetic series
- **b** — iterative accumulation
- **c** — recursive helper with running total

Assumes `n` yields a result within `Number.MAX_SAFE_INTEGER`.
