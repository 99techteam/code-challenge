const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');

const context = vm.createContext({});
for (const file of ['loop.js', 'recursion.js', 'math_formula.js']) {
  vm.runInContext(readFileSync(path.join(__dirname, file), 'utf8'), context);
}

test('formula handles negative integers consistently', () => {
  assert.equal(context.sum_to_n_c(-5), -15);
});

for (const name of ['sum_to_n_a', 'sum_to_n_b', 'sum_to_n_c']) {
  const sum = context[name];
  test(`${name}: positive, negative and zero inputs`, () => {
    for (const [n, expected] of [[0, 0], [-0, 0], [1, 1], [-1, -1], [5, 15], [-5, -15], [10, 55]]) {
      assert.equal(sum(n), expected);
    }
    for (let n = -100; n <= 100; n++) {
      let expected = 0;
      for (let i = 1; i <= Math.abs(n); i++) expected += n < 0 ? -i : i;
      assert.equal(sum(n), expected);
    }
  });

  test(`${name}: rejects invalid inputs and unsafe results`, () => {
    for (const n of [NaN, Infinity, -Infinity, 1.5, -1.5, '5', null, undefined, true]) {
      assert.throws(() => sum(n), { name: 'TypeError' });
    }
    for (const n of [134217728, -134217728, Number.MAX_SAFE_INTEGER]) {
      assert.throws(() => sum(n), { name: 'RangeError' });
    }
  });
}

test('recursion and formula handle the safe boundary without stack overflow', () => {
  const n = 134217727;
  const expected = Number(BigInt(n) * (BigInt(n) + 1n) / 2n);
  for (const sum of [context.sum_to_n_b, context.sum_to_n_c]) {
    assert.equal(sum(n), expected);
    assert.equal(sum(-n), -expected);
  }
});
