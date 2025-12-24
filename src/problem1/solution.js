// Iterative Loop (Most Readable – O(n))
const sum_to_n_a = function(n) {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
}

// Recursive Approach (Functional Style – O(n))
const sum_to_n_b = function(n) {
  if (n <= 1) return n;
  return n + sum_to_n_b(n - 1);
}

// Mathematical Formula (Fastest – O(1))
const sum_to_n_c = function(n) {
  return (n * (n + 1)) / 2;
}