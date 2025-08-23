function valid_input(n: number) {
  if (n % 1 !== 0 || n > Number.MAX_SAFE_INTEGER) {
    throw new Error("Invalid input");
  }
}

function sum_to_n_a(n: number) {
  valid_input(n);
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
}

function sum_to_n_b(n: number) {
  valid_input(n);
  if (n <= 0) {
    return 0;
  }
  return (n * (n + 1)) / 2;
}

function sum_to_n_c(n: number): number {
  valid_input(n);
  if (n <= 0) {
    return 0;
  }
  return n + sum_to_n_c(n - 1);
}

export { sum_to_n_a, sum_to_n_b, sum_to_n_c };
