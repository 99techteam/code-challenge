/**
 * Problem 4: Three ways to sum to n
 *
 * Contract used for any integer n:
 * - n > 0:  1 + 2 + ... + n
 * - n < 0: -1 + -2 + ... + n
 * - n = 0:  0
 */

export function sum_to_n_a(n: number): number {
  // Arithmetic formula.
  // Time: O(1), Space: O(1). This is the most efficient implementation.
  const sign = n < 0 ? -1 : 1;
  const absoluteN = Math.abs(n);

  return sign * ((absoluteN * (absoluteN + 1)) / 2);
}

export function sum_to_n_b(n: number): number {
  // Iterative accumulation.
  // Time: O(|n|), Space: O(1). Simple and memory-efficient, but slower for large |n|.
  let total = 0;
  const step = n < 0 ? -1 : 1;

  for (let current = step; n < 0 ? current >= n : current <= n; current += step) {
    total += current;
  }

  return total;
}

export function sum_to_n_c(n: number): number {
  // Functional implementation using array generation and reduce.
  // Time: O(|n|), Space: O(|n|). Clear as a demonstration, but less efficient
  // because it allocates an array with one element per number being summed.
  const sign = n < 0 ? -1 : 1;
  const absoluteN = Math.abs(n);

  return Array.from({ length: absoluteN }, (_, index) => sign * (index + 1)).reduce(
    (total, value) => total + value,
    0,
  );
}

