// The complexity of this function is O(n) because it iterates through all numbers from 0 to n once.
// The efficiency of this function is not optimal for large values of n, as it requires n iterations to compute the sum.
// n is <= Math.MAX_SAFE_INTEGER, so we can safely compute the sum without worrying about overflow in JavaScript.
function sum_to_n_a(n: number): number {
  let count = 0
  for (let i = 0; i <= n; i++) {
    count += i
  }
  return count
}

// The complexity of this function is O(1) because it uses a constant number of operations to compute the sum, regardless of the value of n.
// The efficiency of this function is optimal for all values of n, as it computes the sum in constant time.
// n is <= Math.MAX_SAFE_INTEGER, so we can safely compute the sum without worrying about overflow in JavaScript.
function sum_to_n_b(n: number): number {
  return (n * (n + 1)) / 2
}

// The complexity of this function is O(n) because it iterates through all numbers from 1 to n once using recursion.
// The efficiency of this function is not optimal for large values of n, as it requires n iterations to compute the sum.
// n is <= Math.MAX_SAFE_INTEGER, so we can safely compute the sum without worrying about overflow in JavaScript.
function sum_to_n_c(n: number): number {
  return n === 0 ? 0 : n + sum_to_n_c(n - 1)
}
