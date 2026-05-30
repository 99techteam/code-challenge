import { describe, it, expect } from 'vitest';
import {
  sum_to_n_a,
  sum_to_n_b,
  sum_to_n_c,
  sum_to_n_d,
} from '../lib/sumToN';
import {
  addBigNumbers,
  mulBigNumbers,
  divBy2,
  cmpAbs,
} from '../lib/bigNumber';

const BASIC_CASES: Array<[number, number]> = [
  [0, 0],
  [1, 1],
  [2, 3],
  [5, 15],
  [10, 55],
  [100, 5050],
  [1000, 500500],
  [-1, -1],
  [-5, -15],
  [-100, -5050],
];

describe.each([
  ['a', sum_to_n_a],
  ['b', sum_to_n_b],
  ['c', sum_to_n_c],
] as const)('sum_to_n_%s', (label, fn) => {
  for (const [n, expected] of BASIC_CASES) {
    it(`sum_to_n_${label}(${n}) === ${expected}`, () => {
      expect(fn(n)).toBe(expected);
    });
  }
});

describe('a / b / c agree on the integer range', () => {
  for (let n = -50; n <= 200; n++) {
    it(`agree at n=${n}`, () => {
      const a = sum_to_n_a(n);
      const b = sum_to_n_b(n);
      const c = sum_to_n_c(n);
      expect(a).toBe(b);
      expect(b).toBe(c);
    });
  }
});

describe('sum_to_n_d', () => {
  it('accepts number input', () => {
    expect(sum_to_n_d(0)).toBe('0');
    expect(sum_to_n_d(5)).toBe('15');
    expect(sum_to_n_d(100)).toBe('5050');
  });

  it('accepts string input', () => {
    expect(sum_to_n_d('0')).toBe('0');
    expect(sum_to_n_d('5')).toBe('15');
    expect(sum_to_n_d('1000000')).toBe('500000500000');
  });

  it('handles inputs whose result exceeds MAX_SAFE_INTEGER', () => {
    expect(sum_to_n_d('100000000000')).toBe('5000000000050000000000');
  });

  it('handles a 30-digit input (verified against BigInt)', () => {
    const n = '123456789012345678901234567890';
    const big = BigInt(n);
    const expected = ((big * (big + 1n)) / 2n).toString();
    expect(sum_to_n_d(n)).toBe(expected);
  });

  it('handles negative input', () => {
    expect(sum_to_n_d(-5)).toBe('-15');
    expect(sum_to_n_d('-100')).toBe('-5050');
    expect(sum_to_n_d('-100000000000')).toBe('-5000000000050000000000');
  });

  it('matches a / b / c on the small integer range', () => {
    for (let n = -30; n <= 30; n++) {
      expect(sum_to_n_d(n)).toBe(String(sum_to_n_a(n)));
    }
  });

  it('throws on invalid input', () => {
    expect(() => sum_to_n_d('abc')).toThrow();
    expect(() => sum_to_n_d('1.5')).toThrow();
    expect(() => sum_to_n_d('')).toThrow();
    expect(() => sum_to_n_d('--5')).toThrow();
  });
});

describe('bigNumber helpers', () => {
  describe('addBigNumbers', () => {
    it('adds positive numbers', () => {
      expect(addBigNumbers('0', '0')).toBe('0');
      expect(addBigNumbers('999', '1')).toBe('1000');
      expect(addBigNumbers('123', '456')).toBe('579');
      expect(addBigNumbers('99999999999999999999', '1')).toBe(
        '100000000000000000000',
      );
    });
    it('handles signed addition', () => {
      expect(addBigNumbers('-5', '3')).toBe('-2');
      expect(addBigNumbers('5', '-3')).toBe('2');
      expect(addBigNumbers('-5', '-3')).toBe('-8');
      expect(addBigNumbers('5', '-5')).toBe('0');
      expect(addBigNumbers('-100', '50')).toBe('-50');
    });
  });

  describe('mulBigNumbers', () => {
    it('multiplies positive numbers', () => {
      expect(mulBigNumbers('0', '999')).toBe('0');
      expect(mulBigNumbers('12', '12')).toBe('144');
      expect(mulBigNumbers('123', '456')).toBe('56088');
      expect(
        mulBigNumbers('100000000000000000000', '100000000000000000000'),
      ).toBe('10000000000000000000000000000000000000000');
    });
    it('handles signed multiplication', () => {
      expect(mulBigNumbers('-12', '12')).toBe('-144');
      expect(mulBigNumbers('-12', '-12')).toBe('144');
      expect(mulBigNumbers('12', '0')).toBe('0');
    });
  });

  describe('divBy2', () => {
    it('floor-divides by 2', () => {
      expect(divBy2('0')).toBe('0');
      expect(divBy2('2')).toBe('1');
      expect(divBy2('1000')).toBe('500');
      expect(divBy2('1001')).toBe('500');
      expect(divBy2('10000000000000000000000')).toBe('5000000000000000000000');
    });
  });

  describe('cmpAbs', () => {
    it('compares magnitudes', () => {
      expect(cmpAbs('5', '5')).toBe(0);
      expect(cmpAbs('5', '10')).toBe(-1);
      expect(cmpAbs('10', '5')).toBe(1);
      expect(cmpAbs('0005', '5')).toBe(0);
    });
  });
});
