import { validateInput } from "./validation"

// Option A: Arithmetic Series Formula | O(1) time, O(1) space
export const sum_to_n_a = function(n) {
  validateInput(n)

  if (n === 0) return 0
  return (n * (n + 1)) / 2
}

// Option B: Iterative Loop | O(n) time, O(1) space
export const sum_to_n_b = function(n) {
  validateInput(n)

  let sum = 0
  for (let i = 1; i <= n; i++) {
    sum += i
  }
  return sum
}

// Option C: Recursion | O(n) time, O(n) space (stack)
export const sum_to_n_c = function(n) {
  if (n === 0) return 0
  if (n === 1) return 1

  validateInput(n)

  if (n <= 1) return n
  return n + sum_to_n_c(n - 1)
}