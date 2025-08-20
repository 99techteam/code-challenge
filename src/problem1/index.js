function sum_to_n_a(n) {
  return (n * (n + 1)) / 2;
}

function sum_to_n_b(n) {
  return Array.from({ length: n }, (_, i) => i + 1).reduce(
    (acc, curr) => acc + curr,
    0
  );
}

function sum_to_n_c(n) {
  if (n <= 0) return 0;
  return n + sum_to_n_c(n - 1);
}

module.exports = {
  sum_to_n_a,
  sum_to_n_b,
  sum_to_n_c,
};
