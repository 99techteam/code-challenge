# Task

Provide 3 unique implementations of the following function in TypeScript.

- Comment on the complexity or efficiency of each function.

**Input**: `n` - any integer

*Assuming this input will always produce a result lesser than `Number.MAX_SAFE_INTEGER`*.

**Output**: `return` - summation to `n`, i.e. `sum_to_n(5) === 1 + 2 + 3 + 4 + 5 === 15`.

## Solution

Three implementations provided in `sum_to_n.ts`:

| Function | Approach | Time Complexity | Space Complexity |
|----------|----------|-----------------|------------------|
| `sumIterative` | For loop accumulation | O(n) | O(1) |
| `sumRecursive` | Recursive calls | O(n) | O(n) |
| `sumFormula` | Gauss's formula `n*(n+1)/2` | O(1) | O(1) |

## Design Decisions

- **All integers supported**: Positive, zero, and negative values handled correctly
- **Named exports**: Following TypeScript conventions over default exports
- **Descriptive naming**: `sumIterative`, `sumRecursive`, `sumFormula` for clarity
- **JSDoc comments**: Document time/space complexity for each function

## Trade-offs

- **Iterative**: Simple and memory-efficient, but requires O(n) time
- **Recursive**: Elegant but uses O(n) stack space; risks stack overflow for large n
- **Formula**: Optimal O(1) performance, but requires separate logic for negative numbers

## Testing

21 test cases in `sum_to_n.test.ts` covering:
- Positive numbers (1, 5, 100)
- Zero
- Negative numbers (-1, -2, -3)
- Large numbers

