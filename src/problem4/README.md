# Problem 4: Sum to N

Three unique implementations of the `sum_to_n` function in TypeScript with complexity analysis.

## Problem Description

Implement a function that calculates the summation from 1 to n.

**Input:** `n` - any integer  
**Output:** Sum of all integers from 1 to n

**Example:** `sum_to_n(5)` returns `15` (1 + 2 + 3 + 4 + 5)

## Implementations

### 1. Mathematical Formula (sum_to_n_a)
- **Time Complexity:** O(1) - Constant time
- **Space Complexity:** O(1) - Constant space
- **Method:** Uses Gauss's formula: `n * (n + 1) / 2`
- **Best for:** Production use, large values of n

### 2. Iterative Loop (sum_to_n_b)
- **Time Complexity:** O(n) - Linear time
- **Space Complexity:** O(1) - Constant space
- **Method:** Loops through numbers 1 to n, accumulating the sum
- **Best for:** Clarity and simplicity

### 3. Recursive Approach (sum_to_n_c)
- **Time Complexity:** O(n) - Linear time
- **Space Complexity:** O(n) - Linear space (call stack)
- **Method:** Recursive calls breaking down the problem
- **Best for:** Educational purposes, functional programming style
- **Warning:** Risk of stack overflow with very large values

## Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
```

## Running the Code

### Option 1: Using npm scripts (Recommended)

```bash
# Run the TypeScript file
npm start

# Run with auto-reload on file changes
npm run dev

# Run tests
npm test
```

### Option 2: Using npx (No installation required)

```bash
# Run directly with tsx
npx tsx src/index.ts

# Or with ts-node
npx ts-node src/index.ts
```

### Option 3: Compile to JavaScript

```bash
# Compile TypeScript to JavaScript
npm run build

# Run the compiled JavaScript
node src/index.js
```

### Option 4: Using global installations

If you have tsx or ts-node installed globally:

```bash
# With tsx (faster)
tsx src/index.ts

# With ts-node
ts-node src/index.ts
```

## Expected Output

```
sum_to_n_a(5) = 15
sum_to_n_b(5) = 15
sum_to_n_c(5) = 15
```

## Complexity Comparison

| Implementation | Time | Space | Efficiency |
|---------------|------|-------|------------|
| sum_to_n_a    | O(1) | O(1)  | ⭐⭐⭐ Best |
| sum_to_n_b    | O(n) | O(1)  | ⭐⭐ Good   |
| sum_to_n_c    | O(n) | O(n)  | ⭐ Fair    |

## Notes

- Input: `n` - any integer
- Input assumed to produce results less than `Number.MAX_SAFE_INTEGER`
- For production use, **sum_to_n_a** is recommended due to O(1) time complexity

