/**
 * Iterative approach using a for loop.
 * Time Complexity: O(n) — iterates from 1 to n (or 1 down to n for negative)
 * Space Complexity: O(1) — only uses a single accumulator variable
 */
export function sumIterative(n: number): number {
  let sum = 0;
  if (n >= 1) {
    for (let i = 1; i <= n; i++) sum += i;
  } else if (n <= -1) {
    for (let i = 1; i >= n; i--) sum += i;
  }
  return sum;
}

type Thunk<T> = T | (() => Thunk<T>);

function trampoline<T>(fn: () => Thunk<T>): T {
  let result: Thunk<T> = fn();
  while (typeof result === "function") {
    result = (result as () => Thunk<T>)();
  }
  return result;
}

function sumRecHelper(n: number, acc: number): Thunk<number> {
  if (n === 0) return acc;
  if (n > 0) return () => sumRecHelper(n - 1, acc + n);
  if (n === -1) return acc;
  return () => sumRecHelper(n + 1, acc + n);
}

/**
 * Recursive approach with trampoline to avoid stack overflow.
 * Time Complexity: O(|n|) — makes |n| recursive calls
 * Space Complexity: O(1) — trampoline converts recursion to iteration
 */
export function sumRecursive(n: number): number {
  return trampoline(() => sumRecHelper(n, 0));
}

/**
 * Mathematical formula approach (Gauss's formula) using BigInt for precision.
 * Time Complexity: O(1) — constant time computation
 * Space Complexity: O(1) — no additional memory used
 */
export function sumFormula(n: number): number {
  const bigN = BigInt(n);
  if (n >= 0) {
    return Number((bigN * (bigN + 1n)) / 2n);
  }
  return Number(1n + ((1n - bigN) * bigN) / 2n);
}
