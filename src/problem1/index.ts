const sum_to_n_a = function (n: number) {
  if (n <= 0) return 0;
  n = Math.floor(n);
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
};

const sum_to_n_b = function (n: number) {
  if (n <= 0) return 0;
  n = Math.floor(n);
  return (n * (n + 1)) / 2;
};

const sum_to_n_c = function (n: number) {
  if (n <= 0) return 0;
  n = Math.floor(n);
  return Array.from({ length: n }, (_, i) => i + 1).reduce((acc, v) => acc + v, 0);
};
