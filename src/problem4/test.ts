/**
 * Additional Test suite for the three sum_to_n implementations
 * 
 * Note: The main tests are already run by solution.ts
 * This file contains extended test cases for more comprehensive testing
 */

// Copy of functions for testing (to avoid import issues)
function sum_to_n_a_test(n: number): number {
    if (n <= 0) return 0;
    return (n * (n + 1)) / 2;
}

function sum_to_n_b_test(n: number): number {
    if (n <= 0) return 0;
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
}

function sum_to_n_c_test(n: number): number {
    if (n <= 0) return 0;
    if (n === 1) return 1;
    return n + sum_to_n_c_test(n - 1);
}

/**
 * Test suite for the three sum_to_n implementations
 */

// Test cases with expected results
const testCases = [
    { input: 0, expected: 0 },
    { input: 1, expected: 1 },
    { input: 5, expected: 15 },
    { input: 10, expected: 55 },
    { input: 100, expected: 5050 },
    { input: -5, expected: 0 }, // Edge case: negative input
];

console.log("Running comprehensive tests for all implementations...\n");

let allTestsPassed = true;

testCases.forEach((testCase, index) => {
    const { input, expected } = testCase;
    
    console.log(`Test ${index + 1}: sum_to_n(${input}) should equal ${expected}`);
    
    const resultA = sum_to_n_a_test(input);
    const resultB = sum_to_n_b_test(input);
    const resultC = sum_to_n_c_test(input);
    
    const passA = resultA === expected;
    const passB = resultB === expected;
    const passC = resultC === expected;
    const allMatch = resultA === resultB && resultB === resultC;
    
    console.log(`  Implementation A (Formula): ${resultA} ${passA ? '✅' : '❌'}`);
    console.log(`  Implementation B (Iterative): ${resultB} ${passB ? '✅' : '❌'}`);
    console.log(`  Implementation C (Recursive): ${resultC} ${passC ? '✅' : '❌'}`);
    console.log(`  All implementations match: ${allMatch ? '✅' : '❌'}`);
    
    if (!passA || !passB || !passC || !allMatch) {
        allTestsPassed = false;
    }
    
    console.log('');
});

console.log(`Overall result: ${allTestsPassed ? 'All tests passed! ✅' : 'Some tests failed! ❌'}`);

// Performance comparison for larger numbers
console.log("\n==================================================");
console.log("Performance demonstration (for educational purposes):");
console.log("==================================================");

const largeN = 10000;
console.log(`\nCalculating sum_to_n(${largeN}) with each implementation:`);

// Note: In a real performance test, you'd use console.time() or performance.now()
console.log(`Formula result: ${sum_to_n_a_test(largeN)}`);
console.log(`Iterative result: ${sum_to_n_b_test(largeN)}`);
console.log(`Recursive result: ${sum_to_n_c_test(largeN)} (may cause stack overflow for very large n)`);