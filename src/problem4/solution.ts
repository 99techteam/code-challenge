/**
 * Problem 4: Sum to N - Three Different Implementations
 * 
 * Task: Provide 3 unique implementations of a function that calculates
 * the summation from 1 to n (i.e., 1 + 2 + 3 + ... + n)
 */

/**
 * Implementation A: Mathematical Formula (Gauss Formula)
 * 
 * Uses the mathematical formula: n * (n + 1) / 2
 * 
 * Time Complexity: O(1) - Constant time
 * Space Complexity: O(1) - Constant space
 * 
 * This is the most efficient approach as it calculates the result
 * in a single mathematical operation regardless of the input size.
 * 
 * @param n - The upper limit of summation
 * @returns The sum of integers from 1 to n
 */
function sum_to_n_a(n: number): number {
    // Handle edge cases
    if (n <= 0) return 0;
    
    // Gauss formula: sum = n * (n + 1) / 2
    return (n * (n + 1)) / 2;
}

/**
 * Implementation B: Iterative Approach
 * 
 * Uses a simple for loop to accumulate the sum
 * 
 * Time Complexity: O(n) - Linear time
 * Space Complexity: O(1) - Constant space
 * 
 * This is a straightforward approach that's easy to understand
 * and verify. It iterates through each number and adds it to the sum.
 * 
 * @param n - The upper limit of summation
 * @returns The sum of integers from 1 to n
 */
function sum_to_n_b(n: number): number {
    // Handle edge cases
    if (n <= 0) return 0;
    
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
}

/**
 * Implementation C: Recursive Approach
 * 
 * Uses recursion to calculate the sum
 * 
 * Time Complexity: O(n) - Linear time (due to n recursive calls)
 * Space Complexity: O(n) - Linear space (due to call stack)
 * 
 * This approach demonstrates functional programming concepts but
 * is less efficient due to function call overhead and stack usage.
 * For large n, it might cause stack overflow.
 * 
 * @param n - The upper limit of summation
 * @returns The sum of integers from 1 to n
 */
function sum_to_n_c(n: number): number {
    // Base cases
    if (n <= 0) return 0;
    if (n === 1) return 1;
    
    // Recursive case: n + sum of (n-1)
    return n + sum_to_n_c(n - 1);
}

// Export functions for testing
export { sum_to_n_a, sum_to_n_b, sum_to_n_c };

// Example usage and manual testing (commented out for Jest compatibility)
// Uncomment the lines below to run manual tests
/*
function runTests(): void {
    const testValues = [0, 1, 5, 10, 100];
    
    console.log("Testing all three implementations:");
    console.log("=====================================");
    
    testValues.forEach(n => {
        const resultA = sum_to_n_a(n);
        const resultB = sum_to_n_b(n);
        const resultC = sum_to_n_c(n);
        
        console.log(`n = ${n}:`);
        console.log(`  sum_to_n_a: ${resultA}`);
        console.log(`  sum_to_n_b: ${resultB}`);
        console.log(`  sum_to_n_c: ${resultC}`);
        console.log(`  All match: ${resultA === resultB && resultB === resultC}`);
        console.log("");
    });
}

// Run tests automatically only if this file is executed directly
if (require.main === module) {
    runTests();
}
*/