// ==================== Task ====================
// Provide 3 unique implementations of the following function in JavaScript.
// Input: n - any integer
// Output: return - summation to n, i.e. sum_to_n(5) === 1 + 2 + 3 + 4 + 5 === 15.


// Idea: Iterative approach. Uses a loop to add each number from 1 to n to an accumulator.
// Complexity: Time O(n), Space O(1)
var sum_to_n_a = function (n) {
    let sum = 0;
    for (var i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
};

// Idea: Recursive approach. The sum to n is n plus the sum to n-1.
// Complexity: Time O(n), Space O(n) (due to call stack overhead)
var sum_to_n_b = function (n) {
    if (n < 1) {
        return 0;
    }
    return n + sum_to_n_b(n - 1);
};

// Idea: Mathematical formula (Arithmetic progression sum). Uses the formula n * (n + 1) / 2.
// Complexity: Time O(1), Space O(1)
var sum_to_n_c = function (n) {
    return n * (n + 1) / 2;
};

function test() {
    const testCases = [
        { input: 0, expected: 0 },
        { input: 1, expected: 1 },
        { input: 2, expected: 3 },
        { input: 5, expected: 15 },
        { input: 10, expected: 55 },
        { input: 42, expected: 903 },
        { input: 50, expected: 1275 },
        { input: 100, expected: 5050 },
        { input: 500, expected: 125250 },
        { input: 1000, expected: 500500 }
    ];

    console.log("Running 10 test cases for all 3 implementations:\n");

    testCases.forEach(({ input: n, expected }, index) => {
        const resA = sum_to_n_a(n);
        const resB = sum_to_n_b(n);
        const resC = sum_to_n_c(n);

        const passedA = resA === expected;
        const passedB = resB === expected;
        const passedC = resC === expected;
        const allPassed = passedA && passedB && passedC;

        console.log(`Test ${index + 1} (input number 'n' = ${n}, expected result = ${expected}):`);
        console.log(`  sum_to_n_a: ${resA} (${passedA ? "PASS" : "FAIL"})`);
        console.log(`  sum_to_n_b: ${resB} (${passedB ? "PASS" : "FAIL"})`);
        console.log(`  sum_to_n_c: ${resC} (${passedC ? "PASS" : "FAIL"})`);
        console.log(`  Overall result status: ${allPassed ? "PASS" : "FAIL"}`);
        console.log("-----------------------");
    });
}

test();