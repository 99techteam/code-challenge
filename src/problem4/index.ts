/**
 * Iteratively computes the sum from 1 to n using a loop.
 *
 * Time Complexity: O(n) — Iterates through all numbers from 1 to n.
 * Space Complexity: O(1) — Uses constant extra space for sum variable.
 */
export const sumToNWithLoop = (n: number): number => {
  /** Check if sum will exceed Number.MAX_SAFE_INTEGER */
  if (n > 0 && (n * (n + 1)) / 2 > Number.MAX_SAFE_INTEGER) {
    throw new Error('Result exceeds Number.MAX_SAFE_INTEGER');
  }
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
}


/**
 * Computes the sum from 1 to n using the mathematical formula.
 *
 * Time Complexity: O(1) — Direct calculation, no iteration.
 * Space Complexity: O(1) — No extra space required.
 *
 * This is the most optimal approach for this problem.
 */
export const sumToNWithFormula = (n: number): number => {
  /** Check if sum will exceed Number.MAX_SAFE_INTEGER */
  if (n > 0 && (n * (n + 1)) / 2 > Number.MAX_SAFE_INTEGER) {
    throw new Error('Result exceeds Number.MAX_SAFE_INTEGER');
  }
  return (n * (n + 1)) / 2;
}


/**
 * Recursively computes the sum from 1 to n.
 *
 * Time Complexity: O(n) — Recursion depth is n.
 * Space Complexity: O(n) — Call stack grows linearly with n.
 *
 * Not recommended for large n due to stack overflow risk.
 */
export const sumToNWithRecursion = (n: number): number => {
  /** Check if sum will exceed Number.MAX_SAFE_INTEGER */
  if (n > 0 && (n * (n + 1)) / 2 > Number.MAX_SAFE_INTEGER) {
    throw new Error('Result exceeds Number.MAX_SAFE_INTEGER');
  }
  if (n === 0) {
    return 0;
  }
  return n + sumToNWithRecursion(n - 1);
}

/**
 * Memoized recursive computation of sum from 1 to n.
 *
 * Time Complexity: O(n) — Each value from 1 to n is computed once.
 * Space Complexity: O(n) — Stores results for each n in memoization map and call stack.
 *
 * Memoization is used to avoid redundant calculations in recursion, improving efficiency.
 * This technique is especially useful in problems with overlapping sub-problems.
 */
const memo = new Map<number, number>();

export function sumToNMemoRecursion(n: number): number {
  /** Check if sum will exceed Number.MAX_SAFE_INTEGER */
  if (n > 0 && (n * (n + 1)) / 2 > Number.MAX_SAFE_INTEGER) {
    throw new Error('Result exceeds Number.MAX_SAFE_INTEGER');
  }
  if (n <= 0) return 0;

  if (memo.has(n)) {
    return memo.get(n)!;
  }

  const result = n + sumToNMemoRecursion(n - 1);
  memo.set(n, result);

  return result;
}
