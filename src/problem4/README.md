# Problem 4: Sum to N - Three Implementations

## Task Description
Implement three unique versions of a function that calculates the summation from 1 to n:
- `sum_to_n(5) === 1 + 2 + 3 + 4 + 5 === 15`

## Solutions

### Implementation A: Mathematical Formula (Gauss Formula)
```typescript
function sum_to_n_a(n: number): number {
    if (n <= 0) return 0;
    return (n * (n + 1)) / 2;
}
```

**Complexity Analysis:**
- ⏱️ **Time Complexity:** O(1) - Constant time
- 💾 **Space Complexity:** O(1) - Constant space
- ⚡ **Efficiency:** Most efficient - single mathematical operation

**Key Features:**
- Uses Gauss's famous formula for arithmetic series
- Instant calculation regardless of input size
- Best choice for production code

### Implementation B: Iterative Approach
```typescript
function sum_to_n_b(n: number): number {
    if (n <= 0) return 0;
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
}
```

**Complexity Analysis:**
- ⏱️ **Time Complexity:** O(n) - Linear time
- 💾 **Space Complexity:** O(1) - Constant space
- ⚡ **Efficiency:** Moderate - loops through all numbers

**Key Features:**
- Easy to understand and verify
- Good for educational purposes
- Straightforward implementation

### Implementation C: Recursive Approach
```typescript
function sum_to_n_c(n: number): number {
    if (n <= 0) return 0;
    if (n === 1) return 1;
    return n + sum_to_n_c(n - 1);
}
```

**Complexity Analysis:**
- ⏱️ **Time Complexity:** O(n) - Linear time
- 💾 **Space Complexity:** O(n) - Linear space (call stack)
- ⚡ **Efficiency:** Least efficient due to function call overhead

**Key Features:**
- Demonstrates functional programming concepts
- Risk of stack overflow for large inputs
- Elegant mathematical expression of the problem

## Performance Comparison

| Implementation | Time | Space | Best Use Case |
|----------------|------|-------|---------------|
| A (Formula)    | O(1) | O(1)  | Production code, large numbers |
| B (Iterative)  | O(n) | O(1)  | Educational, medium numbers |
| C (Recursive)  | O(n) | O(n)  | Academic, small numbers |

## Files Structure
- `solution.ts` - Contains all three implementations with detailed comments
- `test.ts` - Comprehensive test suite
- `README.md` - This documentation

## Running the Code
```bash
# If you have TypeScript installed
npx tsc solution.ts && node solution.js

# Or run the tests
npx tsc test.ts && node test.js
```

## Edge Cases Handled
- Negative inputs (returns 0)
- Zero input (returns 0)
- Large numbers (within Number.MAX_SAFE_INTEGER)

## Mathematical Verification
For n = 5: 1 + 2 + 3 + 4 + 5 = 15
- Formula: 5 × (5 + 1) / 2 = 5 × 6 / 2 = 15 ✅
- All implementations should return the same result