// Provide 3 unique implementations of the following function in JavaScript.

// **Input**: `n` - any integer

// *Assuming this input will always produce a result lesser than `Number.MAX_SAFE_INTEGER`*.

// **Output**: `return` - summation to `n`, i.e. `sum_to_n(5) === 1 + 2 + 3 + 4 + 5 === 15`.

// Implementation 1
// Mathematical Formula Approach (Gauss's formula)
// Time Complexity: O(1), Space Complexity: O(1)
// The formula for the sum of the first n natural numbers is: n * (n + 1) / 2
var sum_to_n_a = function (n) {
  return (n * (n + 1)) / 2 || 0;
};

// Implementation 2
// Iterative Approach (loop)
// Time Complexity: O(n), Space Complexity: O(1)
// This approach uses a simple loop to iterate from 1 to n, adding each number to a cumulative sum. It handles edge cases by returning 0 for non-positive integers.
var sum_to_n_b = function (n) {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
};

// Implementation 3
// Recursive Approach
// Time Complexity: O(n), Space Complexity: O(n)
// This approach uses recursion to calculate the sum. Recursive solution that breaks down the problem into smaller sub-problems
var sum_to_n_c = function (n) {
  if (n <= 0) return 0;
  return n + sum_to_n_c(n - 1);
};

console.log("sum_to_n_a:", sum_to_n_a(-1)); // Expected: 0
console.log("sum_to_n_b:", sum_to_n_b(-1)); // Expected: 0
console.log("sum_to_n_c:", sum_to_n_c(-1)); // Expected: 0
console.log("------------------------------");

console.log("sum_to_n_a:", sum_to_n_a(0)); // Expected: 0
console.log("sum_to_n_b:", sum_to_n_b(0)); // Expected: 0
console.log("sum_to_n_c:", sum_to_n_c(0)); // Expected: 0
console.log("------------------------------");

console.log("sum_to_n_a:", sum_to_n_a(5)); // Expected: 15
console.log("sum_to_n_b:", sum_to_n_b(5)); // Expected: 15
console.log("sum_to_n_c:", sum_to_n_c(5)); // Expected: 15
console.log("------------------------------");

console.log("sum_to_n_a:", sum_to_n_a(10)); // Expected: 55
console.log("sum_to_n_b:", sum_to_n_b(10)); // Expected: 55
console.log("sum_to_n_c:", sum_to_n_c(10)); // Expected: 55
