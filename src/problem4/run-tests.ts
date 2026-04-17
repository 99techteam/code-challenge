import { sum_to_n_a, sum_to_n_b, sum_to_n_c } from "./sum_to_n";

type TestCase = {
  readonly n: number;
  readonly expected: number;
};

function assertEqual(actual: number, expected: number, label: string): void {
  if (actual !== expected) {
    console.error(`FAIL ${label}: expected ${expected}, received ${actual}`);
    process.exitCode = 1;
    return;
  }

  console.log(`OK   ${label}: ${actual}`);
}

const cases: TestCase[] = [
  { n: 5, expected: 15 },
  { n: 1, expected: 1 },
  { n: 0, expected: 0 },
  { n: -5, expected: 0 },
  { n: 10.8, expected: 55 }
];

for (const testCase of cases) {
  assertEqual(sum_to_n_a(testCase.n), testCase.expected, `sum_to_n_a(${testCase.n})`);
  assertEqual(sum_to_n_b(testCase.n), testCase.expected, `sum_to_n_b(${testCase.n})`);
  assertEqual(sum_to_n_c(testCase.n), testCase.expected, `sum_to_n_c(${testCase.n})`);
}

if (process.exitCode === undefined || process.exitCode === 0) {
  console.log("All Problem 4 tests passed.");
}
