/**
 * Three implementations of sum_to_n.
 * Input: n — any integer.
 * Output: 1 + 2 + … + n (returns 0 when n ≤ 0).
 */

// A — Iterative: O(n) time, O(1) space
var sum_to_n_a = function (n) {
  let sum = 0;
  for (let i = 1; i <= n; i++) sum += i;
  return sum;
};

// B — Mathematical (Gauss formula): O(1) time, O(1) space
var sum_to_n_b = function (n) {
  if (n <= 0) return 0;
  return (n * (n + 1)) / 2;
};

// C — Recursive: O(n) time, O(n) space (call stack)
var sum_to_n_c = function (n) {
  if (n <= 0) return 0;
  return n + sum_to_n_c(n - 1);
};
