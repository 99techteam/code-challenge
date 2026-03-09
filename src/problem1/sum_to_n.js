/**
 * Problem: Summation from 1 to n.
 * Input: n — integer (result assumed < Number.MAX_SAFE_INTEGER).
 * Output: 1 + 2 + ... + n (e.g. sum_to_n(5) === 15).
 *
 * Edge cases handled:
 * - n < 1: returns 0 (empty sum).
 * - Non-integer n: truncated via Math.floor for predictable behavior.
 */

/**
 * Implementation A: Closed-form formula.
 * Uses the identity: 1 + 2 + ... + n = n * (n + 1) / 2.
 *
 * Time:  O(1)
 * Space: O(1)
 */
var sum_to_n_a = function (n) {
  var k = Math.floor(Number(n));
  if (k < 1) return 0;
  return (k * (k + 1)) / 2;
};

/**
 * Implementation B: Iterative loop (for).
 * Accumulates the sum in a single variable.
 *
 * Time:  O(n)
 * Space: O(1)
 */
var sum_to_n_b = function (n) {
  var k = Math.floor(Number(n));
  if (k < 1) return 0;
  var sum = 0;
  for (var i = 1; i <= k; i++) {
    sum += i;
  }
  return sum;
};

/**
 * Implementation C: Recursion.
 * Base case: n < 1 → 0. Otherwise: n + sum_to_n_c(n - 1).
 *
 * Time:  O(n)
 * Space: O(n) — call stack depth
 */
var sum_to_n_c = function (n) {
  var k = Math.floor(Number(n));
  if (k < 1) return 0;
  return k + sum_to_n_c(k - 1);
};

// Export for tests and reuse
if (typeof module !== "undefined" && module.exports) {
  module.exports = { sum_to_n_a, sum_to_n_b, sum_to_n_c };
}
