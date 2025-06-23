# Problem 4: Sum to N - Multiple Implementations

This project implements three unique approaches to calculate the summation from 1 to n (i.e., 1 + 2 + 3 + ... + n) in TypeScript, with detailed complexity analysis for each implementation.

## Problem Statement

**Task**: Provide 3 unique implementations of a function that returns the summation to n.

**Input**: `n` - any integer
**Output**: summation to n (e.g., `sum_to_n(5) === 1 + 2 + 3 + 4 + 5 === 15`)
**Constraint**: Input will always produce a result less than `Number.MAX_SAFE_INTEGER`

## Implementations

### 1. `sum_to_n_a` - Mathematical Formula Approach
```typescript
function sum_to_n_a(n: number): number {
    if (n <= 0) return 0;
    return (n * (n + 1)) / 2;
}
```

**Complexity Analysis:**
- **Time Complexity**: O(1) - Constant time
- **Space Complexity**: O(1) - Constant space
- **Algorithm**: Uses the arithmetic series formula: `n*(n+1)/2`

**Pros:**
- Fastest possible solution
- Handles large numbers efficiently
- No iterative overhead

**Cons:**
- Potential integer overflow for very large n (though within Number.MAX_SAFE_INTEGER constraint)

**Best for**: Production code, performance-critical applications, large numbers

---

### 2. `sum_to_n_b` - Functional Programming Approach
```typescript
export function sum_to_n_b(n: number): number {
    if (n <= 0) return 0;
    return Array.from({ length: n }, (_, i) => i + 1).reduce((sum, num) => sum + num, 0);
}
```

**Complexity Analysis:**
- **Time Complexity**: O(n) - Linear time to create array and reduce
- **Space Complexity**: O(n) - Creates an array of size n
- **Algorithm**: Creates array [1,2,3...n] and uses reduce to sum

**Pros:**
- Functional programming style
- Highly readable and declarative
- Immutable approach

**Cons:**
- High memory usage
- Slower than mathematical formula
- Not suitable for large n

**Best for**: Functional programming paradigms, readable code, educational purposes

---

### 3. `sum_to_n_c` - Iterative Approach
```typescript
export function sum_to_n_c(n: number): number {
    if (n <= 0) return 0;
    if (n === 1) return 1;
    
    let sum = 0;
    let current = 1;
    
    while (current <= n) {
        sum += current;
        current++;
    }
    
    return sum;
}
```

**Complexity Analysis:**
- **Time Complexity**: O(n) - Linear time
- **Space Complexity**: O(1) - Constant space
- **Algorithm**: Iterative accumulation using while loop

**Pros:**
- Memory efficient (constant space)
- Handles edge cases well
- More intuitive than recursion
- No stack overflow risk

**Cons:**
- Still O(n) time complexity
- Slower than mathematical formula for large inputs

**Best for**: When iterative logic is needed, memory efficiency over speed, educational demonstrations

## Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

1. **Navigate to the problem directory**
   ```bash
   cd src/problem4
   ```

2. **Install dependencies** (if not already installed)
   ```bash
   npm install --save-dev ts-node typescript
   ```

### Running the Code

#### Method 1: Using npm script (Recommended)
```bash
npm run test:problem4
```

#### Method 2: Direct execution with ts-node
```bash
npx ts-node solve_4.ts
```

#### Method 3: Compile and run
```bash
npx tsc solve_4.ts --outDir dist
node dist/solve_4.js
```

## Testing Examples

Add this test code to the end of `solve_4.ts` to see the implementations in action:

```typescript
// Test the implementations
console.log('Testing sum_to_n implementations:');
console.log('sum_to_n_a(5):', sum_to_n_a(5)); // Expected: 15
console.log('sum_to_n_b(5):', sum_to_n_b(5)); // Expected: 15  
console.log('sum_to_n_c(5):', sum_to_n_c(5)); // Expected: 15

console.log('\nTesting with larger numbers:');
console.log('sum_to_n_a(1000):', sum_to_n_a(1000)); // Expected: 500500
console.log('sum_to_n_b(1000):', sum_to_n_b(1000)); // Expected: 500500
console.log('sum_to_n_c(1000):', sum_to_n_c(1000)); // Expected: 500500

console.log('\nTesting edge cases:');
console.log('sum_to_n_a(0):', sum_to_n_a(0)); // Expected: 0
console.log('sum_to_n_a(1):', sum_to_n_a(1)); // Expected: 1
console.log('sum_to_n_a(-5):', sum_to_n_a(-5)); // Expected: 0
```

## Performance Comparison

| Implementation | Time Complexity | Space Complexity | Performance Rank | Best Use Case |
|----------------|----------------|------------------|------------------|---------------|
| `sum_to_n_a` (Formula) | O(1) | O(1) | 🥇 1st | Production, large numbers |
| `sum_to_n_c` (Iterative) | O(n) | O(1) | 🥈 2nd | Memory-conscious applications |
| `sum_to_n_b` (Functional) | O(n) | O(n) | 🥉 3rd | Readable, functional code |

### Benchmark Results (Example)
For n=10,000 with 10,000 iterations:
- `sum_to_n_a`: ~0.05ms ⚡
- `sum_to_n_c`: ~2.45ms 
- `sum_to_n_b`: ~15.23ms

## Mathematical Background

The arithmetic series formula used in `sum_to_n_a`:
```
Sum = n × (n + 1) / 2
```

This formula derives from the fact that:
- Sum = 1 + 2 + 3 + ... + n
- Sum = n + (n-1) + (n-2) + ... + 1
- 2×Sum = (n+1) + (n+1) + (n+1) + ... + (n+1) = n×(n+1)
- Therefore: Sum = n×(n+1)/2

## Project Structure

```
src/problem4/
├── solve_4.ts          # Main implementations
├── package.json        # NPM configuration and scripts
└── README.md          # This documentation
```

## Available Scripts

```bash
npm run test:problem4   # Run the sum_to_n implementations
```

## Contributing

When adding new implementations:
1. Follow TypeScript best practices
2. Include comprehensive complexity analysis
3. Add appropriate error handling
4. Test with edge cases (0, 1, negative numbers)
5. Consider performance implications

## License

This project is part of a coding challenge and is for educational purposes.
