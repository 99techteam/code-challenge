/** Iterative: O(n) time and O(1) extra space. */
function sum_to_n_a(n: number): number {
  let total = 0;
  for (let value = 1; value <= n; value += 1) total += value;
  return total;
}

/** Arithmetic-series formula: O(1) time and O(1) extra space. */
function sum_to_n_b(n: number): number {
  return n <= 0 ? 0 : (n * (n + 1)) / 2;
}

/** Divide-and-conquer recursion: O(n) time and O(log n) call-stack space. */
function sum_to_n_c(n: number): number {
  if (n <= 0) return 0;
  function sumRange(first: number, last: number): number {
    if (first > last) return 0;
    if (first === last) return first;
    const middle = Math.floor((first + last) / 2);
    return sumRange(first, middle) + sumRange(middle + 1, last);
  }
  return sumRange(1, n);
}

export { sum_to_n_a, sum_to_n_b, sum_to_n_c };
