// Three different ways to sum 1 to n

// Math formula - O(1)
export function sum_to_n_a(n: number): number {
  if (n <= 0) return 0;
  return (n * (n + 1)) / 2;
}

// Loop approach - O(n) time, O(1) space
export function sum_to_n_b(n: number): number {
  if (n <= 0) return 0;
  let sum = 0;
  for (let i = 1; i <= n; i++) sum += i;
  return sum;
}

// Recursive - O(n) time and space
export function sum_to_n_c(n: number): number {
  if (n <= 0) return 0;
  return n + sum_to_n_c(n - 1);
}
