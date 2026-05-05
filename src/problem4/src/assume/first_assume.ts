// Time Complexity: O(|n|) absolute value
// Space Complexity: O(1)
export function sumToN_A_loop(n: number): number {
  if (!Number.isInteger(n)) {
    throw new Error("Input must be an integer");
  }

  let sum = 0;

  if (n > 0) {
    for (let i = 1; i <= n; i++) sum += i;
  } else {
    for (let i = n; i <= -1; i++) sum += i;
  }

  return sum;
}

// Time Complexity: O(1)
// Space Complexity: O(1)
export function sumToN_A_formula(n: number): number {
  if (!Number.isInteger(n)) {
    throw new Error("Input must be an integer");
  }

  if (n === 0) return 0;

  if (n > 0) {
    return (n * (n + 1)) / 2;
  }

  const abs = Math.abs(n);
  return -(abs * (abs + 1)) / 2;
}

// Time Complexity: O(|n|)
// Space Complexity: O(|n|)
export function sumToN_A_recursive(n: number): number {
  if (!Number.isInteger(n)) {
    throw new Error("Input must be an integer");
  }

  if (n === 0) return 0;

  if (n > 0) {
    return n + sumToN_A_recursive(n - 1);
  }

  return n + sumToN_A_recursive(n + 1);
}
