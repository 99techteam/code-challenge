import { describe, expect, test } from 'bun:test';
import { sum_to_n_a, sum_to_n_b, sum_to_n_c } from './sum.js';

for (const sum of [sum_to_n_a, sum_to_n_b, sum_to_n_c]) {
  describe(sum.name, () => {
    test('handles examples and empty ranges', () => {
      for (const [n, expected] of [[-5, 0], [0, 0], [1, 1], [5, 15], [100, 5050]]) {
        expect(sum(n)).toBe(expected);
      }
    });
    test('matches an independent BigInt calculation', () => {
      for (let n = 0; n <= 1000; n += 7) {
        expect(BigInt(sum(n))).toBe(BigInt(n) * BigInt(n + 1) / 2n);
      }
    });
    test('rejects invalid inputs and unsafe sums', () => {
      for (const n of [NaN, Infinity, 1.5, '5', 134217728]) {
        expect(() => sum(n)).toThrow(RangeError);
      }
    });
  });
}

test('formula remains exact at the safe boundary', () => {
  expect(BigInt(sum_to_n_b(134217727))).toBe(134217727n * 134217728n / 2n);
});
