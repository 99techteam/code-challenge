// Assumption: n < 1 is an empty range, so the sum is 0.

// O(1): Gauss formula. The even factor is halved before multiplying so the
// intermediate product never exceeds the final result and stays exact.
var sum_to_n_a = function (n) {
  if (n < 1) return 0;
  return n % 2 === 0 ? (n / 2) * (n + 1) : n * ((n + 1) / 2);
};

// O(n) time, O(1) space: single accumulator loop.
var sum_to_n_b = function (n) {
  var sum = 0;
  for (var i = 1; i <= n; i++) sum += i;
  return sum;
};

// O(log n) time and stack depth: recursive doubling.
// S(2k) = 2 * S(k) + k^2 and S(2k + 1) = S(2k) + 2k + 1.
var sum_to_n_c = function (n) {
  if (n < 1) return 0;
  if (n === 1) return 1;
  var k = Math.floor(n / 2);
  var even = 2 * sum_to_n_c(k) + k * k;
  return n % 2 === 0 ? even : even + n;
};

if (typeof module !== "undefined") {
  module.exports = { sum_to_n_a: sum_to_n_a, sum_to_n_b: sum_to_n_b, sum_to_n_c: sum_to_n_c };
}
