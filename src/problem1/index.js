var sum_to_n_a = function (n) {
  // your code here

  // Recursive function approach
  if (n < 0) return 0;

  if ([0, 1].includes(n)) return n;

  // Complexity: O(n)
  return n + sum_to_n_a(n - 1);
};

var sum_to_n_b = function (n) {
  // your code here

  // Iterative function approach
  if (n < 0) return 0;
  if ([0, 1].includes(n)) return n;

  // Complexity: O(n)
  let sum = 0;
  for (let i = 0; i <= n; i++) {
    sum += i;
  }
  return sum;
};

var sum_to_n_c = function (n) {
  // your code here

  // Mathematical formula approach
  if (n < 0) return 0;
  if ([0, 1].includes(n)) return n;

  /**
   * S = 1 + 2 + 3 + ... + n
   * S = n + (n-1) + (n-2) + ... + 1
   * ─────────────────────────────────
   * 2S = (n+1) + (n+1) + (n+1) + ... + (n+1)
   * S = (n * (n + 1)) / 2
   */
  // Complexity: O(1)
  return (n * (n + 1)) / 2;
};
