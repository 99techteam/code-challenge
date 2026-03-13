/**
 * Provide 3 unique implementations of the following function in JavaScript.
 *
 * **Input**: `n` - any integer
 *
 * *Assuming this input will always produce a result lesser than `Number.MAX_SAFE_INTEGER`*.
 *
 * **Output**: `return` - summation to `n`, i.e. `sum_to_n(5) === 1 + 2 + 3 + 4 + 5 === 15`.
 */

/**
 * Implementation 1: Iterative approach
 * 
 * Time Complexity: O(n)
 * Space Complexity: O(1)
 */
var sum_to_n_a = function(n) {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
};

/**
 * Implementation 2: Recursive approach
 * 
 * Time Complexity: O(n)
 * Space Complexity: O(n)
 */
var sum_to_n_b = function(n) {
  if (n === 1) {
    return 1;
  }
  return n + sum_to_n_b(n - 1);
};

/**
 * Implementation 3: Formula approach: 1 + 2 + ... + n = n * (n + 1) / 2
 * 
 * Time Complexity: O(1)
 * Space Complexity: O(1)
 */
var sum_to_n_c = function(n) {
  return (n * (n + 1)) / 2;
};

var a = sum_to_n_a(5); // 15
var b = sum_to_n_b(5); // 15
var c = sum_to_n_c(5); // 15

console.log(a, b, c); // 15 15 15