// Implementation A: Iterative
export function sum_to_n_a(n: number): number {
  if (n < 0) throw new Error("n must be non-negative");

  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
}

// Implementation B: Formula (Optimal)
export function sum_to_n_b(n: number): number {
  if (n < 0) throw new Error("n must be non-negative");

  return (n * (n + 1)) / 2;
}

// Implementation C: Recursion
export function sum_to_n_c(n: number): number {
  if (n < 0) throw new Error("n must be non-negative");
  if (n <= 1) return n;

  return n + sum_to_n_c(n - 1);
}
