/**
 * Time Complexity: O(n) - we have a loop for exact n times
 * Space Complexity: O(1) - we only have `sum` variable of primitive type
 */
function sum_to_n_a(n: number): number {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
}

/**
 * Time Complexity: O(1) - just a simple arithmetic operation no loops or condition
 * Space Complexity: O(1) - we don't even have any extra space used here
 */
function sum_to_n_b(n: number): number {
  return (n * (n + 1)) / 2;
}

/**
 * Time Complexity: O(n) - we made exact n conditonal checks by recursice n times
 * Space Complexity: O(n) - each recursice call add an extra layer to the call stack
 */
function sum_to_n_c(n: number): number {
  if (n <= 1) {
    return n;
  }

  return n + sum_to_n_c(n - 1);
}

console.log("======Testing all three implementations:\n");

const testCases = [0, 1, 5, 10, 100];

testCases.forEach((n) => {
  const resultA = sum_to_n_a(n);
  const resultB = sum_to_n_b(n);
  const resultC = sum_to_n_c(n);

  console.log(`sum_to_n(${n}):`);
  console.log(`  Implementation A (Iterative): ${resultA}`);
  console.log(`  Implementation B (Formula):   ${resultB}`);
  console.log(`  Implementation C (Recursive): ${resultC}`);
});
