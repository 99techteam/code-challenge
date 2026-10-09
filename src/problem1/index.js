// Sum the positive integers from 1 through n. The prompt guarantees a safe result.
function sum_to_n_a(n) {
  let sum = 0;
  for (let value = 1; value <= n; value += 1) sum += value;
  return sum;
}

// Arithmetic-series formula: constant time and constant space.
function sum_to_n_b(n) {
  return n <= 0 ? 0 : (n * (n + 1)) / 2;
}

// Divide-and-conquer recursion keeps the call stack logarithmic.
function sum_to_n_c(n) {
  if (n <= 0) return 0;
  function sumRange(first, last) {
    if (first > last) return 0;
    if (first === last) return first;
    const middle = Math.floor((first + last) / 2);
    return sumRange(first, middle) + sumRange(middle + 1, last);
  }
  return sumRange(1, n);
}

module.exports = { sum_to_n_a, sum_to_n_b, sum_to_n_c };
