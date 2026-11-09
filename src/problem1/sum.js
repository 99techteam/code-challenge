const MAX_N = 134217727;

function validate(n) {
  if (!Number.isSafeInteger(n) || n > MAX_N) {
    throw new RangeError('Expected an integer whose sum is a safe integer.');
  }
}

export function sum_to_n_a(n) {
  validate(n);
  let total = 0;
  for (let i = 1; i <= n; i++) total += i;
  return total;
}

export function sum_to_n_b(n) {
  validate(n);
  if (n <= 0) return 0;
  return n % 2 === 0 ? (n / 2) * (n + 1) : n * ((n + 1) / 2);
}

export function sum_to_n_c(n) {
  validate(n);
  function sumRange(start, end) {
    if (start > end) return 0;
    if (start === end) return start;
    const middle = Math.floor((start + end) / 2);
    return sumRange(start, middle) + sumRange(middle + 1, end);
  }
  return sumRange(1, n);
}
