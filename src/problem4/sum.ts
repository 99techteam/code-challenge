const sameSum = [0, 1];

const isValidInput = (
  n: number
): boolean =>
  Number.isInteger(n) && n >= 0;

const normalizeInput = (
  n: number
): number =>
  Math.abs(Math.trunc(n));

/**
 * Base Gateway (Higher-Order Function)
 * Wraps a core logic function with validation and normalization.
 */
const base_gateway = (
  coreFormula: (n: number) => number
): ((n: number) => number) => {
  return (n: number): number => {
    const normalized = normalizeInput(n);
    
    if (!isValidInput(normalized)) {
      // If invalid, safely return the base case (0) without re-invoking the gateway
      return 0; 
    }

    if (sameSum.includes(n)) {
      // If 0, 1, the sum, output, will be the same as input
      return n;
    }
    
    // Pass the cleaned, normalized input to the actual formula
    return coreFormula(normalized);
  };
};

const formula = (n: number): number => (n * (n + 1)) / 2;

const looping = (n: number): number => {
  let sum = 0;
  for (let i = n; i > 0; i--) {
    sum += i;
  }
  return sum;
}

const recursion = (n: number): number => {
  if (n <= 0) return 0;
  return n + recursion(n - 1);
}

/**
 * **Implementation A: Carl Friedrich Gauss's Arithmetic Progression**
 * 
 * **Complexity Analysis**
 * - **Time Complexity:** O(1) (Constant Time) — Executes a fixed number of 
 *   arithmetic operations (one addition, one multiplication, one division)
 * - **Space Complexity:** O(1) (Constant Space) — No additional memory or 
 *   variables are allocated.
 */
export const sum_to_n_a = base_gateway(formula);

/**
 * **Implementation B: The Recursive Approach**
 * 
 * **Complexity Analysis:**
 * - **Time Complexity:** O(n) (Linear Time). The function calls itself n times before hitting the base case.
 * - **Space Complexity:** O(n) (Linear Space). Each recursive call adds a new frame to the call stack.
 */
export const sum_to_n_b = base_gateway(recursion);

/**
 * **Implementation C: The Iterative Loop**
 * 
 * **Complexity Analysis:**
 * - **Time Complexity:** O(n) (Linear Time). The loop runs exactly n times, so the execution time scales linearly with the size of n.
 * - **Space Complexity:** O(1) (Constant Space). It only requires a single variable (sum) to track the running total, occupying minimal, fixed memory.
 */
export const sum_to_n_c = base_gateway(looping);
