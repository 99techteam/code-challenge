//Implementation A: Iterative loop
export const sum_to_n_a = (n: number): number => {
  if (n <= 0) return 0;

  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
};

// Implementation B: Mathematical formula
export const sum_to_n_b = (n: number): number => {
  if (n <= 0) return 0;

  return (n * (n + 1)) / 2;
};

// Implementation C: Functional style (Array + reduce)
export const sum_to_n_c = (n: number): number => {
  if (n <= 0) return 0;

  return Array.from({ length: n }, (_, i) => i + 1).reduce(
    (acc, cur) => acc + cur,
    0
  );
};
