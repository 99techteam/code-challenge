// sum_to_n(n) returns 1 + 2 + ... + n.
// For n <= 0 we return 0 (the prompt only illustrates positives; empty sum is the safe default).

// Iterative — plain accumulation, easy to trace.
var sum_to_n_a = function (n: number): number {
  let total = 0;
  for (let i = 1; i <= n; i++) {
    total += i;
  }
  return total;
};

// Closed form — arithmetic series identity n*(n+1)/2, O(1).
var sum_to_n_b = function (n: number): number {
  if (n <= 0) return 0;
  return (n * (n + 1)) / 2;
};

// Functional — build the sequence then fold; useful if you need to filter or map terms first.
var sum_to_n_c = function (n: number): number {
  if (n <= 0) return 0;
  return Array.from({ length: n }, (_, i) => i + 1).reduce((acc, x) => acc + x, 0);
};
