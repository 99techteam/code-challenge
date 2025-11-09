/**
 * Implementation A: Mathematical Formula (Gauss's Formula)
 * 
 * Time Complexity: O(1) - Constant time
 * Space Complexity: O(1) - Constant space
 * 
 * This is the most efficient approach using the mathematical formula:
 * sum = n * (n + 1) / 2
 * 
 * Efficiency: Best - performs only arithmetic operations regardless of input size.
 */
function sum_to_n_a(n: number): number {
    return (n * (n + 1)) / 2;
}

/**
 * Implementation B: Iterative Loop
 * 
 * Time Complexity: O(n) - Linear time
 * Space Complexity: O(1) - Constant space
 * 
 * Classic iterative approach that loops through all numbers from 1 to n,
 * accumulating the sum. Simple and straightforward but less efficient than
 * the mathematical formula for large values of n.
 * 
 * Efficiency: Moderate - requires n iterations to complete.
 */
function sum_to_n_b(n: number): number {
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
}

/**
 * Implementation C: Recursive Approach
 * 
 * Time Complexity: O(n) - Linear time
 * Space Complexity: O(n) - Linear space (due to call stack)
 * 
 * Recursive solution that breaks down the problem into smaller subproblems.
 * Each recursive call adds to the call stack, making it less memory-efficient.
 * Risk of stack overflow for very large values of n.
 * 
 * Efficiency: Least efficient - requires both n recursive calls and n stack frames.
 * Not recommended for production use with large inputs due to stack overflow risk.
 */
function sum_to_n_c(n: number): number {
    if (n <= 0) {
        return 0;
    }
    return n + sum_to_n_c(n - 1);
}

// Export all functions
export { sum_to_n_a, sum_to_n_b, sum_to_n_c };

// Example usage and testing:
const testValue = 5;
console.log(`sum_to_n_a(${testValue}) = ${sum_to_n_a(testValue)}`); // 15
console.log(`sum_to_n_b(${testValue}) = ${sum_to_n_b(testValue)}`); // 15
console.log(`sum_to_n_c(${testValue}) = ${sum_to_n_c(testValue)}`); // 15

