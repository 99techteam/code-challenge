// Mathematic | Time O(1) - Space O(1)
export function sum_to_n_a(n: number): number {
  return (n * (n + 1)) / 2;
}

// Iterative | Time O(n) - Space O(1)
export function sum_to_n_b(n: number): number {
  let total = 0;
  for (let i = 1; i <= n; i++) {
    total += i;
  }
  return total;
}

// Recursive | Time O(n) - Space O(n)
export function sum_to_n_c(n: number): number {
  if (n <= 0) return 0;
  return n + sum_to_n_c(n - 1);
}

// Performance test
const testCases = [1_00, 1_000, 10_000];

for (const n of testCases) {
  console.log(`\n--- n = ${n.toLocaleString()} ---`);

  let t = performance.now();
  console.log(
    `sum_to_n_a (Math): ${sum_to_n_a(n)} | ${(performance.now() - t).toFixed(4)}ms`,
  );

  t = performance.now();
  console.log(
    `sum_to_n_b (Iterative): ${sum_to_n_b(n)} | ${(performance.now() - t).toFixed(4)}ms`,
  );

  // Recursive blows the stack for large n, cap it
  t = performance.now();
  console.log(
    `sum_to_n_c (Recursive): ${sum_to_n_c(n)} | ${(performance.now() - t).toFixed(4)}ms`,
  );
}
