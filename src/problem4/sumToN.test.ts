import assert from 'assert';
import { sum_to_n_a, sum_to_n_b, sum_to_n_c } from './sumToN';

const cases: Array<{ n: number; expected: number }> = [
  { n: 5, expected: 15 },
  { n: 10, expected: 55 },
  { n: 1, expected: 1 },
  { n: 0, expected: 1 },
  { n: -3, expected: -5 }
];

for (const { n, expected } of cases) {
  assert.strictEqual(sum_to_n_a(n), expected, `sum_to_n_a(${n})`);
  assert.strictEqual(sum_to_n_b(n), expected, `sum_to_n_b(${n})`);
  assert.strictEqual(sum_to_n_c(n), expected, `sum_to_n_c(${n})`);
}

console.log('All sum_to_n tests passed.');
