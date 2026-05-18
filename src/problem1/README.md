# Problem 1: Sum to N

This folder contains three unique JavaScript implementations of a function that calculates the summation of numbers from 1 to `n`.

## Implementations

### Implementation A: Iterative Approach
- **Function:** `sum_to_n_a(n)`
- **Logic:** Uses a simple `for` loop to iterate from 1 to `n`, cumulatively adding each number to a sum variable.
- **Time Complexity:** O(n)
- **Space Complexity:** O(1)

### Implementation B: Mathematical Formula
- **Function:** `sum_to_n_b(n)`
- **Logic:** Uses the arithmetic progression sum formula `n * (n + 1) / 2` to compute the sum directly. This is the most optimal approach.
- **Time Complexity:** O(1)
- **Space Complexity:** O(1)

### Implementation C: Recursive Approach
- **Function:** `sum_to_n_c(n)`
- **Logic:** Recursively adds the current `n` to the summation of numbers up to `n - 1`. It uses a base case of `n <= 1` to terminate the recursion.
- **Time Complexity:** O(n)
- **Space Complexity:** O(n) due to the call stack overhead.

## How to Run

You will need [Node.js](https://nodejs.org/) installed on your machine to execute the JavaScript file.

1. Open your terminal.
2. Navigate to this directory (`src/problem1`) if you aren't already there:
   ```bash
   cd src/problem1
   ```
3. Run the script using Node.js:
   ```bash
   node index.js
   ```

By default, the script will output the summation of numbers up to `10` for all three implementations (which is `55`). You can modify the `console.log()` statements at the bottom of `index.js` to test different values of `n`.
