/*
 * Problem 4: Three ways to implement sum_to_n(n).
 *
 * Assumption:
 * The prompt says n can be any integer, but defines the operation with
 * sum_to_n(5) === 1 + 2 + 3 + 4 + 5.
 *
 * For n <= 0, I interpret "sum to n" as walking from 1 down to n.
 * Example: sum_to_n(-3) === 1 + 0 + (-1) + (-2) + (-3) === -5.
 *
 * The prompt also guarantees the result is less than Number.MAX_SAFE_INTEGER.
 */

export function sum_to_n_a(n: number): number {
  if (n >= 1) {
    return (n * (n + 1)) / 2;
  }
  const absoluteN = Math.abs(n);
  return 1 - (absoluteN * (absoluteN + 1)) / 2;
}

export function sum_to_n_b(n: number): number {
  let sum = 0;
  const step = n >= 1 ? 1 : -1;

  for (
    let current = 1;
    step === 1 ? current <= n : current >= n;
    current += step
  ) {
    sum += current;
  }

  return sum;
}

export function sum_to_n_c(n: number): number {
  const sumRange = (start: number, end: number): number => {
    if (start === end) {
      return start;
    }

    const middle = Math.floor((start + end) / 2);
    return sumRange(start, middle) + sumRange(middle + 1, end);
  };

  return n >= 1 ? sumRange(1, n) : sumRange(n, 1);
}

const sampleInput = 5;

console.log("sum_to_n_a:", sum_to_n_a(sampleInput));
console.log("sum_to_n_b:", sum_to_n_b(sampleInput));
console.log("sum_to_n_c:", sum_to_n_c(sampleInput));
