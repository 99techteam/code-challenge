const sum_to_n_a = (n: number) => {
  let result = 0;
  for (let i = 1; i <= n; i++) {
    result += i;
  }
  return result;
};

const sum_to_n_b = (n: number) => (n * (n + 1)) / 2;

const sum_to_n_c = (n: number) => {
  if (n <= 0) return 0;
  return n + sum_to_n_c(n - 1);
};
