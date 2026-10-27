import assert from 'node:assert/strict';
import test from 'node:test';
import { sum_to_n_a, sum_to_n_b, sum_to_n_c } from './sum.ts';

for (const [name, fn] of Object.entries({ sum_to_n_a, sum_to_n_b, sum_to_n_c })) {
  test(name, () => {
    for (const [n, expected] of [[-5, 0], [0, 0], [1, 1], [5, 15], [10_000, 50_005_000]]) {
      assert.equal(fn(n), expected);
    }
    assert.throws(() => fn(1.5), RangeError);
  });
}
