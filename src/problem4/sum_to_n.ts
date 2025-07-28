/**
 * Way 1: reduce
 * Time: O(n)
 * Space: O(n)
 */

export function sum_to_n_a(n: number): number {
  if (n <= 0) return 0
  const array = Array.from({ length: n + 1 }, (_, i) => i)
  return array.reduce((a, b) => a + b, 0)
}

/**
 * Way 2: Iteration
 * Time: O(n)
 * Space: O(1)
 */

export function sum_to_n_b(n: number): number {
  if (n <= 0) return 0
  let sum = 0
  for (let i = 0; i <= n; i++) {
    sum += i
  }
  return sum
}

/**
 * Way 3: Math
 * Time: O(1)
 * Space: O(1)
 */

export function sum_to_n_c(n: number): number {
  if (n <= 0) return 0
  return (n * (n + 1)) / 2
}
