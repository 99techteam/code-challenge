import { describe, expect, it } from 'vitest';
import { sum_to_n_a, sum_to_n_b, sum_to_n_c } from './index';

const MAX_N = 134_217_727;
const MAX_SUM = 9_007_199_187_632_128;

function reference(n: number): number {
  let sum = 0;
  for (let i = Math.min(1, n); i <= Math.max(-1, n); i++) sum += i;
  return sum;
}

const implementations = [
  ["sum_to_n_a (Gauss's formula)", sum_to_n_a],
  ['sum_to_n_b (iterative)', sum_to_n_b],
  ['sum_to_n_c (recursive halving)', sum_to_n_c],
] as const;

describe.each(implementations)('%s', (_name, sumToN) => {
  it('matches the example: sum_to_n(5) === 15', () => {
    expect(sumToN(5)).toBe(15);
  });

  it.each([
    [0, 0],
    [1, 1],
    [2, 3],
    [10, 55],
    [100, 5050],
  ])('sums 1..%i to %i', (n, expected) => {
    expect(sumToN(n)).toBe(expected);
  });

  it.each([
    [-1, -1],
    [-5, -15],
    [-100, -5050],
  ])('sums %i..-1 to %i for a negative n', (n, expected) => {
    expect(sumToN(n)).toBe(expected);
  });

  it('agrees with a brute-force reference for every n in -200..200', () => {
    for (let n = -200; n <= 200; n++) {
      expect(sumToN(n)).toBe(reference(n));
    }
  });

  it('is exact at the largest n whose sum is a safe integer', () => {
    expect(sumToN(MAX_N)).toBe(MAX_SUM);
    expect(sumToN(-MAX_N)).toBe(-MAX_SUM);
    expect(Number.isSafeInteger(sumToN(MAX_N))).toBe(true);
  });

  it.each([1.5, -0.5, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'rejects a non-integer n: %s',
    (n) => {
      expect(() => sumToN(n)).toThrow(RangeError);
    },
  );
});
