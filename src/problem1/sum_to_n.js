// @ts-nocheck
// Problem 1: Three unique implementations of sum_to_n function
// Input: n - any integer
// Output: summation to n, i.e. sum_to_n(5) === 1 + 2 + 3 + 4 + 5 === 15

// Approach A: Mathematical Formula (O(1) time complexity)
// Uses the arithmetic series formula: n * (n + 1) / 2
var sum_to_n_a = function (n) {
  // Handle edge cases
  if (n <= 0) return 0;

  // Mathematical formula for sum of consecutive integers from 1 to n
  return (n * (n + 1)) / 2;
};

// Approach B: Iterative Loop (O(n) time complexity)
// Traditional loop approach, accumulating sum step by step
var sum_to_n_b = function (n) {
  // Handle edge cases
  if (n <= 0) return 0;

  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
};

// Approach C: Recursive Approach (O(n) time complexity)
// Recursive function that calls itself until base case is reached
var sum_to_n_c = function (n) {
  // Base cases
  if (n <= 0) return 0;
  if (n === 1) return 1;

  // Recursive case: n + sum of (n-1)
  return n + sum_to_n_c(n - 1);
};
