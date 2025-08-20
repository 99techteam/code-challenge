const { sum_to_n_a, sum_to_n_b, sum_to_n_c } = require('./index');

const testCases = [
  { n: 0, expected: 0 },
  { n: 1, expected: 1 },
  { n: 5, expected: 15 },
  { n: 10, expected: 55 },
  { n: 100, expected: 5050 },
];

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    console.error(`❌ ${message} | Expected: ${expected}, Got: ${actual}`);
    process.exitCode = 1;
  } else {
    console.log(`✅ ${message}`);
  }
}

testCases.forEach(({ n, expected }) => {
  assertEqual(sum_to_n_a(n), expected, `sum_to_n_a(${n})`);
  assertEqual(sum_to_n_b(n), expected, `sum_to_n_b(${n})`);
  assertEqual(sum_to_n_c(n), expected, `sum_to_n_c(${n})`);
});