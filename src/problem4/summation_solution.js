function sum_to_n_a(n) {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
}

function sum_to_n_b(n) {
  const arr = Array.from({ length: n }, (_, i) => i + 1);
  return arr.reduce((acc, curr) => acc + curr, 0);
}

function sum_to_n_c(n) {
  // Base case
  if (n <= 1) {
    return n;
  }
  return n + sum_to_n_c(n - 1);
}

export { sum_to_n_a, sum_to_n_b, sum_to_n_c };
