// Problem 4: Three ways to sum to n (TypeScript)
// ================================================

/**
 * Method 1: Iterative approach using a for loop
 * 
 * Time Complexity: O(n) - loops n times
 * Space Complexity: O(1) - only uses a single variable for sum
 * 
 * Efficiency: Simple and straightforward, but slower for large n
 * Use case: Good for small to medium values of n, easy to understand
 */
function sum_to_n_a(n: number): number {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
}

/**
 * Method 2: Mathematical formula (Gauss formula)
 * Formula: n * (n + 1) / 2
 * 
 * Time Complexity: O(1) - constant time, single calculation
 * Space Complexity: O(1) - no additional space needed
 * 
 * Efficiency: Most efficient approach, instant calculation regardless of n
 * Use case: Best for any size of n, especially large values
 * Note: This is the optimal solution
 */
function sum_to_n_b(n: number): number {
  return (n * (n + 1)) / 2;
}

/**
 * Method 3: Recursive approach
 * 
 * Time Complexity: O(n) - makes n recursive calls
 * Space Complexity: O(n) - call stack grows to n depth
 * 
 * Efficiency: Least efficient due to function call overhead and stack usage
 * Use case: Demonstrates recursion concept but not recommended for large n
 * Warning: May cause stack overflow for very large values of n
 */
function sum_to_n_c(n: number): number {
  if (n <= 1) {
    return n;
  }
  return n + sum_to_n_c(n - 1);
}

// Test cases
console.log('Testing sum_to_n_a:');
console.log(`sum_to_n_a(5) = ${sum_to_n_a(5)}`); // Expected: 15
console.log(`sum_to_n_a(10) = ${sum_to_n_a(10)}`); // Expected: 55
console.log(`sum_to_n_a(100) = ${sum_to_n_a(100)}`); // Expected: 5050

console.log('\nTesting sum_to_n_b:');
console.log(`sum_to_n_b(5) = ${sum_to_n_b(5)}`); // Expected: 15
console.log(`sum_to_n_b(10) = ${sum_to_n_b(10)}`); // Expected: 55
console.log(`sum_to_n_b(100) = ${sum_to_n_b(100)}`); // Expected: 5050

console.log('\nTesting sum_to_n_c:');
console.log(`sum_to_n_c(5) = ${sum_to_n_c(5)}`); // Expected: 15
console.log(`sum_to_n_c(10) = ${sum_to_n_c(10)}`); // Expected: 55
console.log(`sum_to_n_c(100) = ${sum_to_n_c(100)}`); // Expected: 5050
