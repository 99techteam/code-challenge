var sum_to_n_a = function (n) {
  return Array.from({ length: n }, (_, i) => i + 1).reduce((a, b) => a + b, 0);
};

var sum_to_n_b = function (n) {
  return (n * (n + 1)) / 2;
};

var sum_to_n_c = function (n) {
  return n === 1 ? 1 : n + sum_to_n_c(n - 1);
};
