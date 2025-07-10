// Solution A: For loop
// Time complexity: O(n); Space complexity: O(1)
const sum_to_n_a = (n) => {
  if (n <= 0) return 0;
  let sum = 0;
  for (let i = 0; i <= n; i++) {
    sum += i;
  }
  return sum;
};

// Solution B: Recursion
// Time complexity: O(n); Space complexity: O(n)
const sum_to_n_b = (n) => {
  if (n <= 0) return 0;
  return n + sum_to_n_b(n - 1);
};

// Solution C: Math Formula
// Time complexity: O(1); Space complexity: O(1)
const sum_to_n_c = (n) => {
  if (n <= 0) return 0;
  return (n * (n + 1)) / 2;
};

const testNum = 12;

console.log("Solution A result:", sum_to_n_a(testNum));
console.log("Solution B result:", sum_to_n_b(testNum));
console.log("Solution C result:", sum_to_n_c(testNum));
