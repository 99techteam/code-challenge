# Problem 4: Three ways to sum to n

# Overview
This repository contains three unique implementations in TypeScript to calculate the summation of integers from 1 to `n` (e.g., `sum_to_n(5) === 1 + 2 + 3 + 4 + 5 === 15`). 

Each implementation explores a different algorithmic approach, varying in time and space complexity.

# Implementation A: Iterative Approach
This approach uses a standard `for` loop to incrementally add each number from 1 to `n` to a running total.

# Implementation B: Mathematical Formula (Optimal)
This approach utilizes the arithmetic progression sum formula: `n * (n + 1) / 2`.

# Implementation C: Recursive Approach
This approach solves the problem by breaking it down into smaller sub-problems, calling itself with `n - 1` until it reaches the base case (`n <= 1`).

## How to Run

Ensure you have [Node.js](https://nodejs.org/) and TypeScript installed.

1. Install dependencies (if testing libraries are configured):
   npm install

2. Compile the TypeScript file:
  npx tsc src/sum.ts

3. Run tests (assuming Jest is set up from your earlier configurations):
  npm test