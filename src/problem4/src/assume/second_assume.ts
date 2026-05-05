// Time Complexity: O(n)
// Space Complexity: O(1)
export function sumToN_B_loop(n: number): number {
  if (!Number.isInteger(n)) {
    throw new Error("Input must be an integer");
  }

  if (n < 0) {
    throw new Error("Input must be non-negative");
  }

  let sum = 0;
  for (let i = 1; i <= n; i++) sum += i;

  return sum;
}

// Time Complexity: O(1)
// Space Complexity: O(1)
export function sumToN_B_formula(n: number): number {
  if (!Number.isInteger(n)) {
    throw new Error("Input must be an integer");
  }

  if (n < 0) {
    throw new Error("Input must be non-negative");
  }

  return (n * (n + 1)) / 2;
}

// Time Complexity: O(n)
// Space Complexity: O(n)
export function sumToN_B_recursive(n: number): number {
  if (!Number.isInteger(n)) {
    throw new Error("Input must be an integer");
  }

  if (n < 0) {
    throw new Error("Input must be non-negative");
  }

  if (n === 0) return 0;

  return n + sumToN_B_recursive(n - 1);
}
