/*
========================================================
Problem 1: Three ways to sum to n 
========================================================

Task:
Provide 3 unique implementations of the following function in JavaScript.
Input: n - any integer
*Assuming this input will always produce a result lesser than `Number.MAX_SAFE_INTEGER`.
Output: return - summation to n, i.e. sum_to_n(5) === 1 + 2 + 3 + 4 + 5 === 15
========================================================
*/


/*--------------------------------------------------------
Implementation A — Iterative Approach
--------------------------------------------------------
Function Signature Example:
sum_to_n_a(5) => 15

Explanation:
Uses a loop to accumulate values from 1 to n.
Time Complexity: O(n)
Space Complexity: O(1)

*/
var sum_to_n_a = function(n) {
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
};


/*--------------------------------------------------------
Implementation B — Formula Approach (Optimal)
--------------------------------------------------------
Function Signature Example:
sum_to_n_b(5) => 15

Explanation :
Uses Gauss’ summation formula: sum = n * (n + 1) / 2
No loop needed. Constant time solution.
Time Complexity: O(1)
Space Complexity: O(1)

*/
var sum_to_n_b = function(n) {
    return n * (n + 1) / 2;
};


/*--------------------------------------------------------
Implementation C — Functional Approach
--------------------------------------------------------
Function Signature Example:
sum_to_n_c(5) => 15

Explanation :
Generates an array [1..n] and sums using reduce().
Demonstrates modern JavaScript and functional programming style.
Time Complexity: O(n)
Space Complexity: O(n)

*/
var sum_to_n_c = function(n) {
    return Array.from({ length: n }, (_, i) => i + 1)
        .reduce((acc, val) => acc + val, 0);
};


/*--------------------------------------------------------
Test Cases
--------------------------------------------------------
Verifies correctness of all 3 implementations
*/
function runTests() {
    const testCases = [
        { input: 0, expected: 0 },
        { input: 1, expected: 1 },
        { input: 5, expected: 15 },
        { input: 10, expected: 55 },
        { input: 100, expected: 5050 }
    ];

    const implementations = [
        { name: "Iterative", fn: sum_to_n_a },
        { name: "Formula", fn: sum_to_n_b },
        { name: "Functional", fn: sum_to_n_c }
    ];

    console.log("Running Tests...\n");

    testCases.forEach(({ input, expected }) => {
        console.log(`Test n = ${input} (expected: ${expected})`);
        implementations.forEach(({ name, fn }) => {
            const result = fn(input);
            const pass = result === expected;
            console.log(
                `  ${name.padEnd(12)} → ${result} ${pass ? "✅ PASS" : "❌ FAIL"}`
            );
        });
        console.log("");
    });

    console.log("All tests completed.");
}

// Execute test cases
runTests();