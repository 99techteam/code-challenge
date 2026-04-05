//*Assuming this input will always produce a result lesser than `Number.MAX_SAFE_INTEGER`*.

/**
 * Iterative approach - uses a simple for loop to accumulate the sum.
 * Time Complexity: O(n)
 * Space Complexity: O(1)
 *
 * @param {number} n - Any integer
 * @returns {number} - Sum of integers from 1 to n
 */
var sum_to_n_a = function (n) {
  var sum = 0;
  for (var i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
};

/**
 * Mathematical formula - uses the arithmetic series formula: n(n+1)/2 or Gauss formula
 * This is derived from pairing terms: (1+n) + (2+(n-1)) + ... = n+1 each
 * Time Complexity: O(1)
 * Space Complexity: O(1)
 *
 * @param {number} n - Any integer
 * @returns {number} - Sum of integers from 1 to n
 */
var sum_to_n_b = function (n) {
  return (n * (n + 1)) / 2;
};

/**
 * Recursive approach - breaks down the problem into n + sum_to_n(n-1)
 * Base case: when n <= 0, return 0
 * Time Complexity: O(n)
 * Space Complexity: O(n) due to call stack
 *
 * @param {number} n - Any integer
 * @returns {number} - Sum of integers from 1 to n
 */
var sum_to_n_c = function (n) {
  if (n <= 0) return 0;
  return n + sum_to_n_c(n - 1);
};
