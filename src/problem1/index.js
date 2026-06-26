// Three unique implementations of summation to n.

// Implementation A: closed-form (Gauss) formula. O(1) time and space.
var sum_to_n_a = function (n) {
    const sign = n < 0 ? -1 : 1;
    const m = Math.abs(n);
    return sign * (m * (m + 1)) / 2;
};

// Implementation B: iterative accumulation. O(n) time, O(1) space.
var sum_to_n_b = function (n) {
    let sum = 0;
    const sign = n < 0 ? -1 : 1;
    for (let i = 1; i <= Math.abs(n); i++) {
        sum += i * sign;
    }
    return sum;
};

// Implementation C: functional reduce over a generated range. O(n) time and space.
var sum_to_n_c = function (n) {
    const sign = n < 0 ? -1 : 1;
    return Array.from({ length: Math.abs(n) }, function (_, i) {
        return (i + 1) * sign;
    }).reduce(function (acc, value) {
        return acc + value;
    }, 0);
};

// --- Tests ---------------------------------------------------------------
// Contract: any integer. Negative n sums |n| terms with n's sign, e.g.
// sum_to_n(-5) === -(1+2+3+4+5) === -15. All three should agree everywhere.
function runTestCases() {
    const testCases = [
        { input: 0, expected: 0 },
        { input: 1, expected: 1 },
        { input: 5, expected: 15 },
        { input: 10, expected: 55 },
        { input: 100, expected: 5050 },
        { input: -1, expected: -1 },
        { input: -5, expected: -15 },
        { input: -10, expected: -55 },
        { input: -100, expected: -5050 },
    ];

    const implementations = [
        { name: "Implementation A", fn: sum_to_n_a },
        { name: "Implementation B", fn: sum_to_n_b },
        { name: "Implementation C", fn: sum_to_n_c },
    ];

    console.log("Running Tests...\n");

    let passed = 0;
    let failed = 0;

    testCases.forEach(({ input, expected }) => {
        console.log(`Test n = ${input} (expected: ${expected})`);
        implementations.forEach(({ name, fn }) => {
            const result = fn(input);
            const pass = result === expected;
            pass ? passed++ : failed++;
            console.log(
                `  ${name}: ${result} → ${pass ? "PASS" : "FAIL"}`
            );
        });
        console.log("");
    });

    const total = passed + failed;
    console.log(`All tests completed: ${passed}/${total} passed, ${failed} failed.`);
}

// Execute test cases
runTestCases();