function asSummationIndex(n: unknown): number {
  if (typeof n !== "number") {
    throw new TypeError("n must be a number");
  }
  if (!Number.isFinite(n)) {
    throw new TypeError("n must be finite (not NaN or ±Infinity)");
  }
  if (!Number.isInteger(n)) {
    throw new TypeError("n must be an integer");
  }
  return n;
}

// Iterative. Time: O(n). Space: O(1).
export const sum_to_n_a = (n: number): number => {
  const k = asSummationIndex(n);
  let total = 0;
  for (let i = 1; i <= k; i++) {
    total += i;
  }
  return total;
};

// Closed form n(n+1)/2. Time: O(1). Space: O(1).
export const sum_to_n_b = (n: number): number => {
  const k = asSummationIndex(n);
  if (k < 1) return 0;
  return (k * (k + 1)) / 2;
};

// Recursive. Time: O(n). Space: O(n) call stack (auxiliary).
export const sum_to_n_c = (n: number): number => {
  const k = asSummationIndex(n);
  if (k < 1) return 0;
  return k + sum_to_n_c(k - 1);
};
