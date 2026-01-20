/**
 * Validates the input n for the sum_to_n function.
 *
 * @param {any} n - The input to validate.
 * @throws {Error} If the input is invalid.
 */
export const validateInput = function(n) {
  if (typeof n !== 'number') {
    throw new Error("Input must be a number")
  }

  if (!Number.isInteger(n)) {
    throw new Error("Input must be an integer")
  }

  if (n < 0) {
    throw new Error("Input must be a non-negative integer")
  }

  if (n > Number.MAX_SAFE_INTEGER) {
    throw new Error("Input exceeds MAX_SAFE_INTEGER")
  }
}
