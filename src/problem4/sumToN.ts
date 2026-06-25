export function sum_to_n_a(n: number): number {
  // O(|n|) time, O(1) space. This loops from 1 to n and adds each integer.
  // For n <= 1, this returns the sum of the integer range from 1 to n inclusive.
  const step = n >= 1 ? 1 : -1;
  let total = 0;
  for (let i = 1; i !== n; i += step) {
    total += i;
  }
  return total + n;
}

export function sum_to_n_b(n: number): number {
  // O(1) time, O(1) space. Uses the arithmetic series formula for the inclusive range [1, n].
  // If n is negative, the formula still computes the integer sum for the range from n to 1.
  const start = Math.min(1, n);
  const end = Math.max(1, n);
  const count = end - start + 1;
  return ((start + end) * count) / 2;
}

export function sum_to_n_c(n: number): number {
  // O(|n|) time, O(|n|) space. Constructs the integer range and reduces it.
  // This is less efficient in memory than the other versions, but it is expressive.
  const start = Math.min(1, n);
  const end = Math.max(1, n);
  const length = end - start + 1;
  return Array.from({ length }, (_, index) => start + index).reduce((sum, value) => sum + value, 0);
}
