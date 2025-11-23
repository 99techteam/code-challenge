// Utility function: calculates expected sum safely
function safeSumCheck(n) {
  const sum = (n * (n + 1)) / 2
  if (sum > Number.MAX_SAFE_INTEGER) {
    throw new Error(`Summation exceeds Number.MAX_SAFE_INTEGER: ${sum}`)
  }
  return sum
}

// Using Math.imul + Safety Check
var sum_to_n_a = function (n) {
  safeSumCheck(n) // ensure safe integer before computing
  return Math.imul(n, n + 1) / 2
}

// Using Array + Reduce + Safety Check
var sum_to_n_b = function (n) {
  safeSumCheck(n)
  return Array.from({ length: n }, (_, i) => i + 1).reduce(
    (acc, val) => acc + val,
    0
  )
}

// Recursion + Safety Check
var sum_to_n_c = function (n) {
  safeSumCheck(n)
  if (n <= 1) return n
  return n + sum_to_n_c(n - 1)
}
