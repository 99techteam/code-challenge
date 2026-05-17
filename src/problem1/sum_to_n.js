/**
 * Problem 1: Three ways to sum to n
 *
 * For any integer `n`, return the summation 1 + 2 + ... + n.
 *   sum_to_n(5)   === 15
 *   sum_to_n(0)   === 0
 *   sum_to_n(-3)  === -6   // mirrors the positive case: -(1+2+3)
 *
 * The problem guarantees the result fits within Number.MAX_SAFE_INTEGER,
 * so each implementation is judged purely on time/space complexity and style.
 */

// Implementation A — iterative loop.
// Time:  O(n)   Space: O(1)
// The most direct translation of the definition. Easy to read, no recursion
// stack, no allocations. A safe default when the input range is unknown.
var sum_to_n_a = function (n) {
  const sign = n < 0 ? -1 : 1;
  const limit = Math.abs(n);
  let total = 0;
  for (let i = 1; i <= limit; i++) {
    total += i;
  }
  return sign * total;
};

// Implementation B — closed-form (Gauss) formula.
// Time:  O(1)   Space: O(1)
// Sum of an arithmetic series: n * (n + 1) / 2. Constant-time regardless of n.
// The formula naturally produces the negated result for negative n
// (e.g. n = -3 → -3 * -2 / 2 = 3 ... we still want -6, see the sign mirror).
// We mirror the sign so sum_to_n_b(-3) === -(1+2+3) === -6, matching A and C.
var sum_to_n_b = function (n) {
  const sign = n < 0 ? -1 : 1;
  const m = Math.abs(n);
  return sign * (m * (m + 1)) / 2;
};

// Implementation C — functional reduce over a range.
// Time:  O(n)   Space: O(n)   (the intermediate array)
// Showcases a declarative style: build [1..|n|] and fold it with addition.
// Trades memory for expressiveness; useful when composing with other
// array transforms in a pipeline.
var sum_to_n_c = function (n) {
  const sign = n < 0 ? -1 : 1;
  const limit = Math.abs(n);
  return sign * Array.from({ length: limit }, (_, i) => i + 1)
    .reduce((acc, x) => acc + x, 0);
};

// --- Quick self-check (run with `node sum_to_n.js`) ---
if (typeof require !== 'undefined' && require.main === module) {
  const cases = [0, 1, 5, 10, 100, -5];
  const expected = { 0: 0, 1: 1, 5: 15, 10: 55, 100: 5050, '-5': -15 };
  for (const n of cases) {
    const a = sum_to_n_a(n);
    const b = sum_to_n_b(n);
    const c = sum_to_n_c(n);
    const ok = a === expected[n] && b === expected[n] && c === expected[n];
    console.log(`n=${n}  a=${a}  b=${b}  c=${c}  ${ok ? 'OK' : 'FAIL'}`);
  }
}

module.exports = { sum_to_n_a, sum_to_n_b, sum_to_n_c };
