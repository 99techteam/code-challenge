// Solution 1: Iterative
const sum_to_n_a = function (n: number) {
  let s = 0;
  for (let i = 1; i <= n; i++) {
    s += i;
  }
  return s;
};

// Solution 2: Array functional using reduce
const sum_to_n_b = function (n: number) {
  const arr = Array.from({ length: n }, (_, i) => i + 1);
  return arr.reduce((a, v) => a + v, 0);
};

// Solution 3: Mathematical formula
const sum_to_n_c = function (n: number) {
  return (n * (n + 1)) / 2;
};

// Test Case
const test = () => {
  // Replace this test case whenever you want to change
  const test_cases = [
    { n: 0, expected: 0 },
    { n: 1, expected: 1 },
    { n: 50, expected: 1275 },
    { n: 100, expected: 5050 },
    { n: 5000, expected: 12502500 },
    { n: 10000, expected: 50005000 },
  ];

  test_cases.forEach(({ n, expected }) => {
    console.log(`\nTest case: n=${n}`);
    const result_a = sum_to_n_a(n);
    console.log(
      `Function: Iterative, Input: ${n}, Output: ${result_a}`,
      result_a === expected ? "✅ Correct" : `❌ Wrong Expected: ${expected}`,
    );
    const result_b = sum_to_n_b(n);
    console.log(
      `Function: Functional, Input: ${n}, Output: ${result_b}`,
      result_b === expected ? "✅ Correct" : `❌ Wrong Expected: ${expected}`,
    );
    const result_c = sum_to_n_c(n);
    console.log(
      `Function: Mathematical, Input: ${n}, Output: ${result_c}`,
      result_c === expected ? "✅ Correct" : `❌ Wrong Expected: ${expected}`,
    );
  });
};

test();
