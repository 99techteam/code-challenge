/**
 * 1st solution
 * O(1) time, O(1) space
 */
export const sum_to_n_a = (n: number): number => {
  return (n * (n + 1)) / 2;
};

/**
 * 2nd solution: Iterative
 * O(n) time, O(1) space
 */
export const sum_to_n_b = (n: number): number => {
  let sum = 0;

  for (let i = 1; i <= n; i++) {
    sum += i;
  }

  return sum;
};

/**
 * 3rd solution: Recursive
 * O(n) time, O(n) space
 */
export const sum_to_n_c = (n: number): number => {
  if (n <= 1) {
    return n;
  }

  return n + sum_to_n_c(n - 1);
};
