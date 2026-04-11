/**
 * Problem 1: Three ways to sum to n
 *
 * Provide 3 unique implementations of the following function in JavaScript.
 * Input:  n - any integer
 * Output: return - summation to n, i.e. sum_to_n(5) === 1 + 2 + 3 + 4 + 5 === 15
 *
 * Assuming this input will always produce a result lesser than Number.MAX_SAFE_INTEGER.
 */

/**
 * Implementation A: Gauss formula (mathematical)
 * Time complexity:  O(1) — single arithmetic expression
 * Space complexity: O(1)
 *
 * Uses the closed-form triangular number formula: n*(n+1)/2
 */
var sum_to_n_a = function (n) {
  return (n * (n + 1)) / 2;
};

/**
 * Implementation B: Iterative loop
 * Time complexity:  O(n) — iterates once through 1..n
 * Space complexity: O(1)
 */
var sum_to_n_b = function (n) {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
};

/**
 * Implementation C: Array reduce
 * Time complexity:  O(n) — builds array of length n then reduces it
 * Space complexity: O(n) — intermediate array allocation
 *
 * Uses Array.from to generate [1, 2, ..., n] then sums via reduce.
 */
var sum_to_n_c = function (n) {
  return Array.from({ length: n }, (_, i) => i + 1).reduce(
    (acc, val) => acc + val,
    0
  );
};

module.exports = { sum_to_n_a, sum_to_n_b, sum_to_n_c };
