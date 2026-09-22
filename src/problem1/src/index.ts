/** Shared guard: non-integer n (1.5, NaN, ±Infinity) has no sum, so every approach rejects it. */
function assertInteger(n: number): void {
  if (!Number.isInteger(n)) {
    throw new RangeError(`n must be an integer, received ${String(n)}`);
  }
}

/** Gauss's formula n(n + 1) / 2, halving the even factor first so nothing exceeds the sum. */
export function sum_to_n_a(n: number): number {
  assertInteger(n);
  if (n < 0) return -sum_to_n_a(-n);

  return n % 2 === 0 ? (n / 2) * (n + 1) : n * ((n + 1) / 2);
}

/** Iterative: add 1 through n in a loop, the most literal reading of the definition. */
export function sum_to_n_b(n: number): number {
  assertInteger(n);
  if (n < 0) return -sum_to_n_b(-n);

  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
}

/** Recursive halving: S(2k) = 2·S(k) + k² and S(2k + 1) = S(2k) + 2k + 1, so depth is O(log n). */
export function sum_to_n_c(n: number): number {
  assertInteger(n);
  if (n < 0) return -sum_to_n_c(-n);
  if (n <= 1) return n;

  if (n % 2 === 1) return sum_to_n_c(n - 1) + n;
  const k = n / 2;
  return 2 * sum_to_n_c(k) + k * k;
}
