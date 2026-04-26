
// Time complexity: O(n)
// Space complexity: O(1)
function sum_to_n_a(n: number): number {
  let sum = 0;

  for (let i = 1; i <= n; i++) {
    sum += i;
  }

  return sum;
}


// Time complexity: O(1)
// Space complexity: O(1)
function sum_to_n_b(n: number): number {
  return (n * (n + 1)) / 2;
}


// Time complexity: O(n)
// Space complexity: O(n)
function sum_to_n_c(n: number): number {
  const memo = {};

  function sum(x: number): number {
    if (x <= 1) return x;
    if (memo[x] !== undefined) return memo[x];

    memo[x] = x + sum(x - 1);
    return memo[x];
  }

  return sum(n);
}