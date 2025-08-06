// Time Complexity: O(1)
// Space Complexity: O(1)
function sum_to_n_a(n) {
  return (n * (n + 1)) / 2;
};

// Time Complexity: O(n)
// Space Complexity: O(n)
function sum_to_n_b(n) {
  return Array.from({ length: n }, (_, i) => i + 1).reduce((acc, curr) => acc + curr, 0);
};

// Time Complexity: O(n)
// Space Complexity: O(n)
function sum_to_n_c(n) {
  if (n <= 0) return 0;
  return n + sum_to_n_c(n - 1);
};

module.exports = {
  sum_to_n_a,
  sum_to_n_b,
  sum_to_n_c,
};
