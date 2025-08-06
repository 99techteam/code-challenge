const assert = require('assert');
const { sum_to_n_a, sum_to_n_b, sum_to_n_c } = require('./index');

function expectedSum(n) {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
}

// Test values (feel free to add more)
const testValues = [0, 1, 2, 5, 10, 100, 1000];

function runTests() {
  testValues.forEach((n) => {
    const expected = expectedSum(n);

    assert.strictEqual(sum_to_n_a(n), expected, `sum_to_n_a failed for n=${n}`);
    assert.strictEqual(sum_to_n_b(n), expected, `sum_to_n_b failed for n=${n}`);
    assert.strictEqual(sum_to_n_c(n), expected, `sum_to_n_c failed for n=${n}`);
  });

  console.log('All tests passed!');
}

runTests();
