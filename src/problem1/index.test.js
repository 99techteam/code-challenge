const test = require("node:test");
const assert = require("node:assert/strict");
const { sum_to_n_a, sum_to_n_b, sum_to_n_c } = require("./index.js");

const impls = { sum_to_n_a, sum_to_n_b, sum_to_n_c };

for (const [name, fn] of Object.entries(impls)) {
  test(`${name} matches known sums`, () => {
    assert.equal(fn(1), 1);
    assert.equal(fn(5), 15);
    assert.equal(fn(10), 55);
    assert.equal(fn(100), 5050);
  });

  test(`${name} returns 0 for n below 1`, () => {
    assert.equal(fn(0), 0);
    assert.equal(fn(-1), 0);
    assert.equal(fn(-1000), 0);
  });
}

test("implementations agree on every n in a range, odd and even", () => {
  for (let n = -5; n <= 5000; n++) {
    const expected = n < 1 ? 0 : (n * (n + 1)) / 2;
    assert.equal(sum_to_n_a(n), expected, `a(${n})`);
    assert.equal(sum_to_n_b(n), expected, `b(${n})`);
    assert.equal(sum_to_n_c(n), expected, `c(${n})`);
  }
});

test("exact at the largest n whose sum stays below MAX_SAFE_INTEGER", () => {
  let n = 134217727;
  while ((BigInt(n) * BigInt(n + 1)) / 2n > BigInt(Number.MAX_SAFE_INTEGER)) n -= 1;
  const expected = Number((BigInt(n) * BigInt(n + 1)) / 2n);
  assert.equal(sum_to_n_a(n), expected);
  assert.equal(sum_to_n_b(n), expected);
  assert.equal(sum_to_n_c(n), expected);
  assert.equal(sum_to_n_a(n - 1), expected - n);
});
