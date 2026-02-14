/**
 * Problem 1: Three ways to sum to n
 * Requirement: Write a function that calculates the sum of numbers from 1 to n
 * using 3 different implementations.
 */

// Method 1: Using a Loop (Vòng lặp)
// Time Complexity: O(n)
// Space Complexity: O(1)
function sum_to_n_v1(n) {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
}

// Method 2: Using a Math Formula (Công thức toán học)
// Formula: n * (n + 1) / 2
// Time Complexity: O(1)
// Space Complexity: O(1)
// This is the most efficient approach
function sum_to_n_v2(n) {
  return (n * (n + 1)) / 2;
}

// Method 3: Using Recursion (Đệ quy)
// Time Complexity: O(n)
// Space Complexity: O(n) due to call stack
function sum_to_n_v3(n) {
  if (n <= 1) {
    return n;
  }
  return n + sum_to_n_v3(n - 1);
}

// Test cases to verify all implementations
console.log("Testing sum_to_n implementations:");
console.log("-----------------------------------");

const testCases = [1, 5, 10, 15];

testCases.forEach(n => {
  const result1 = sum_to_n_v1(n);
  const result2 = sum_to_n_v2(n);
  const result3 = sum_to_n_v3(n);
  
  console.log(`n = ${n}:`);
  console.log(`  Method 1 (Loop):      ${result1}`);
  console.log(`  Method 2 (Formula):   ${result2}`);
  console.log(`  Method 3 (Recursion): ${result3}`);
  console.log(`  All equal: ${result1 === result2 && result2 === result3 ? '✓' : '✗'}`);
  console.log();
});

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    sum_to_n_v1,
    sum_to_n_v2,
    sum_to_n_v3
  };
}
