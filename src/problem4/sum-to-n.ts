/**
 * Iterative approach
 * @param n number
 * @returns number
 */
export const sum_to_n_a = (n: number): number => {
  let sum = 0;
  const step = n >= 1 ? 1 : -1;

  for (let i = 1; i !== n + step; i += step) {
    sum += i;
  }

  return sum;
};

/**
 * Mathematical formula approach
 * @param n number
 * @returns number
 */
export const sum_to_n_b = (n: number): number => {
  if (n <= 0) return 0;

  return (n * (n + 1)) / 2;
};

/**
 * Recursive approach
 * @param n number
 * @returns number
 */
export const sum_to_n_c = (n: number): number => {
  if (n === 0) return 0;

  return n > 0
    ? n + sum_to_n_c(n - 1)
    : n + sum_to_n_c(n + 1);
};
