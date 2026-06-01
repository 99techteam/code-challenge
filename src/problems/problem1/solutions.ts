// ── Implementation A: Gaussian closed-form formula O(1) ──────────────────────
export const sum_to_n_a = (n: number): number => {
  if (n <= 0) {
    return 0
  }
  return (n * (n + 1)) / 2
}

// ── Implementation B: Iterative loop O(n) ────────────────────────────────────
export const sum_to_n_b = (n: number): number => {
  if (n <= 0) {
    return 0
  }
  let sum = 0
  for (let i = 1; i <= n; i++) {
    sum += i
  }
  return sum
}

// ── Implementation C: Recursion O(n) ─────────────────────────────────────────
export const sum_to_n_c = (n: number): number => {
  if (n <= 0) {
    return 0
  }
  if (n === 1) {
    return 1
  }
  return n + sum_to_n_c(n - 1)
}
