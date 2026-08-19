// Three unique implementations of sum_to_n(n) = 1 + 2 + ... + n

// a) Iterative loop
// Time: O(n) — one addition per iteration
// Space: O(1) — single accumulator
function sum_to_n_a(n: number): number {
  let sum = 0;
  for (let i = 1; i <= n; i++) sum += i;
  return sum;
}

// b) Mathematical formula (Gauss sum)
// Time: O(1) — constant number of arithmetic ops regardless of n
// Space: O(1)
// Fastest and most scalable; the only one safe for very large n.
function sum_to_n_b(n: number): number {
  return (n * (n + 1)) / 2;
}

// c) Recursive
// Time: O(n) — n recursive calls
// Space: O(n) — call stack grows with n, risks a stack overflow for large n
function sum_to_n_c(n: number): number {
  if (n <= 0) return 0;
  return n + sum_to_n_c(n - 1);
}

export { sum_to_n_a, sum_to_n_b, sum_to_n_c };
