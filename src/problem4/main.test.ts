import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { sum_to_n_a, sum_to_n_b, sum_to_n_c } from './main';

const implementations: [string, (n: number) => number][] = [
  ['sum_to_n_a (iterative)', sum_to_n_a],
  ['sum_to_n_b (recursive)', sum_to_n_b],
  ['sum_to_n_c (formula)', sum_to_n_c],
];

for (const [name, fn] of implementations) {
  describe(name, () => {
    test('n = 1 returns 1', () => assert.equal(fn(1), 1));
    test('n = 5 returns 15', () => assert.equal(fn(5), 15));
    test('n = 10 returns 55', () => assert.equal(fn(10), 55));
    test('n = 100 returns 5050', () => assert.equal(fn(100), 5050));
    test('n = 0 returns 1 (sum 0..1)', () => assert.equal(fn(0), 1));
    test('n = 2 returns 3', () => assert.equal(fn(2), 3));
    test('n = 1000 returns 500500', () => assert.equal(fn(1000), 500500));
    test('n = -1 returns 0 (sum -1..1)', () => assert.equal(fn(-1), 0));
    test('n = -2 returns -2 (sum -2..1)', () => assert.equal(fn(-2), -2));
    test('n = -3 returns -5 (sum -3..1)', () => assert.equal(fn(-3), -5));
  });
}
