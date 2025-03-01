// O(n)
function sum_to_n_a(n: number): number {
  let sum = 0;
  for (let i = 0; i <= n; i++) {
    sum += i;
  }
  return sum;
}
// O(1)
//using formula
function sum_to_n_b(n: number): number {
  return (n * (n + 1)) / 2;
}
//O(n)
//recursion
function sum_to_n_c(n: number): number {
  if (n == 1) {
    return 1;
  }
  return n + sum_to_n_c(n - 1);
}
