/**
 * Validates that the input is a non-negative integer.
 * @param n - The input number to validate.
 * @throws {TypeError} If the input is not a non-negative integer.
 */
export function validateInput(n: number): asserts n is number {
  if (!Number.isInteger(n) || n < 0) {
    throw new TypeError("Input n must be a non-negative integer");
  }
}