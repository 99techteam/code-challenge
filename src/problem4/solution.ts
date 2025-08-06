/**
 * Approach 1: Simple Loop
 * - Easy to maintain and modify for other operations (+, -, *, etc.).
 * - More intuitive and safe than recursion (no stack overflow risk).
 * - Slower than Gauss’s formula for large n due to the loop.
 * Time complexity: O(n)
 * Space complexity: O(1)
 */
function sum_to_n_a(n: number): number {
  let sum = 0;
  for (let i = 1; i <= n; i++) sum += i;
  return sum;
}


/**
 * Approach 2: Recursion
 * - Elegant and expressive, but not practical for large n.
 * - May cause stack overflow if n is large (due to call stack depth).
 * - Similar time complexity to the loop version.
 * Time complexity: O(n)
 * Space complexity: O(n) — due to recursive call stack
 */
function sum_to_n_b(n: number): number {
  if (n <= 1) return n;
  return n + sum_to_n_b(n - 1);
}


/**
 * Approach 3: Mathematical Formula (Gauss's Formula)
 * - Fastest and most efficient.
 * - Works only for known mathematical patterns (like arithmetic series).
 * - Less flexible if operation or rule changes.
 * Time complexity: O(1)
 * Space complexity: O(1)
 */
function sum_to_n_c(n: number): number {
  return (n * (n + 1)) / 2;
}

/**
 * Simple test runner
 */
function runTests() {
  const testCases = [0, 1, 5, 10, 100, 1000];

  for (const n of testCases) {
    const a = sum_to_n_a(n);
    const b = sum_to_n_b(n);
    const c = sum_to_n_c(n);

    const allEqual = a === b && b === c;
    console.log(`n = ${n}: a=${a}, b=${b}, c=${c} => ${allEqual ? "PASS" : "FAIL"}`);
  }
}
runTests();
