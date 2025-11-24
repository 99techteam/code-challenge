import { sumToN1, sumToN2, sumToN3 } from "./sumToN";

const testCases = [5, 10, 100, 1000, 10000];

console.log("Testing sumToN functions:");
console.log("========================");

testCases.forEach((n) => {
    console.log(`\nTesting with n = ${n}:`);

    const start1 = performance.now();
    const result1 = sumToN1(n);
    const end1 = performance.now();

    const start2 = performance.now();
    const result2 = sumToN2(n);
    const end2 = performance.now();

    const start3 = performance.now();
    const result3 = sumToN3(n);
    const end3 = performance.now();

    console.log(`  sumToN1: ${result1} (${(end1 - start1).toFixed(4)}ms)`);
    console.log(`  sumToN2: ${result2} (${(end2 - start2).toFixed(4)}ms)`);
    console.log(`  sumToN3: ${result3} (${(end3 - start3).toFixed(4)}ms)`);

    // Verify all results are equal
    const allEqual =
        result1.toString() === result2.toString() &&
        result2.toString() === result3.toString();
    console.log(`  Results match: ${allEqual}`);
});

// Test with a very large number to see the difference
console.log("\n\nTesting with large number (100000000):");
const largeN = 100000000;

const start1Large = performance.now();
const result1Large = sumToN1(largeN);
const end1Large = performance.now();

console.log(
    `sumToN1: ${result1Large} (${(end1Large - start1Large).toFixed(4)}ms)`
);

const start2Large = performance.now();
const result2Large = sumToN2(largeN);
const end2Large = performance.now();

console.log(
    `sumToN2: ${result2Large} (${(end2Large - start2Large).toFixed(4)}ms)`
);

const start3Large = performance.now();
const result3Large = sumToN3(largeN);
const end3Large = performance.now();

console.log(
    `sumToN3: ${result3Large} (${(end3Large - start3Large).toFixed(4)}ms)`
);
