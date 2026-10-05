var sum_to_n_a = function (n) {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
};

var sum_to_n_b = function (n) {
  return (n * (n + 1)) / 2;
};

var sum_to_n_c = function (n) {
  if (n <= 0) return 0;
  return n + sum_to_n_c(n - 1);
};

function runTestCases() {
  const recursionSafeCases = [0, 1, 5, 10, 100, 1000];
  const largeOnlyCases = [1_000_000, 12345678];
  let allPassed = true;

  for (const n of recursionSafeCases) {
    const a = sum_to_n_a(n);
    const b = sum_to_n_b(n);
    const c = sum_to_n_c(n);
    const expected = (n * (n + 1)) / 2;
    const passed = a === expected && b === expected && c === expected;
    allPassed = allPassed && passed;

    console.log(
      `sum_to_n(${n}) => a=${a} b=${b} c=${c} expected=${expected} ${
        passed ? "PASS" : "FAIL"
      }`
    );
  }

  for (const n of largeOnlyCases) {
    const a = sum_to_n_a(n);
    const b = sum_to_n_b(n);
    const expected = (n * (n + 1)) / 2;
    const passed = a === expected && b === expected;
    allPassed = allPassed && passed;

    console.log(
      `sum_to_n(${n}) => a=${a} b=${b} expected=${expected} (c skipped: would overflow the call stack) ${
        passed ? "PASS" : "FAIL"
      }`
    );
  }

  console.log(allPassed ? "\nAll test cases passed." : "\nSome test cases failed.");
  return allPassed;
}

runTestCases();

module.exports = { sum_to_n_a, sum_to_n_b, sum_to_n_c, runTestCases };