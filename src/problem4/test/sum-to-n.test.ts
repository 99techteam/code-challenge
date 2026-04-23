import { sum_to_n_a, sum_to_n_b, sum_to_n_c } from "../src/sum-to-n";

type SumFunction = (n: number) => number;

const implementations: Array<[string, SumFunction]> = [
    ["sum_to_n_a", sum_to_n_a],
    ["sum_to_n_b", sum_to_n_b],
    ["sum_to_n_c", sum_to_n_c],
];

const validCases: Array<[number, number]> = [
    [0, 0],
    [1, 1],
    [2, 3],
    [5, 15],
    [10, 55],
    [100, 5050],
    [-1, -1],
    [-2, -3],
    [-5, -15],
    [-10, -55],
    [100000, 5000050000],
    [-100000, -5000050000],
];

const invalidCases = [
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
    1.5,
    Number.MAX_SAFE_INTEGER + 1,
];

function assertEqual(actual: number, expected: number, label: string): void {
    if (actual !== expected) {
        throw new Error(`${label}: expected ${expected}, received ${actual}`);
    }
}

function assertThrows(run: () => unknown, label: string): void {
    let threw = false;

    try {
        run();
    } catch {
        threw = true;
    }

    if (!threw) {
        throw new Error(`${label}: expected an error`);
    }
}

function logPass(message: string): void {
    console.log(`[PASS] ${message}`);
}

let passed = 0;

for (const [name, fn] of implementations) {
    console.log(`\nRUNNING ${name}...`);

    for (const [input, expected] of validCases) {
        assertEqual(fn(input), expected, `${name}(${input})`);
        logPass(`${name}(${input}) => ${expected}`);
        passed += 1;
    }

    for (const input of invalidCases) {
        assertThrows(() => fn(input), `${name}(${String(input)})`);
        logPass(`${name}(${String(input)}) throws ERROR`);
        passed += 1;
    }
}

console.log(`All tests passed (${passed} checks).`);
