// Three unique implementations of sum_to_n(n) = 1 + 2 + ... + n

// a) Iterative loop — O(n) time, O(1) space
function sum_to_n_a(n) {
  let sum = 0;
  for (let i = 1; i <= n; i++) sum += i;
  return sum;
}

// b) Mathematical formula (Gauss sum) — O(1) time, O(1) space
function sum_to_n_b(n) {
  return (n * (n + 1)) / 2;
}

// c) Recursive — O(n) time, O(n) space (call stack)
function sum_to_n_c(n) {
  if (n <= 0) return 0;
  return n + sum_to_n_c(n - 1);
}

module.exports = { sum_to_n_a, sum_to_n_b, sum_to_n_c };
