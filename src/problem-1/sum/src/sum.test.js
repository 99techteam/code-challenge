// sum.test.js
import { describe, test, expect } from 'vitest';
import { sum_to_n_a, sum_to_n_b, sum_to_n_c } from './sum';

const implementations = [
    {
        name: 'sum_to_n_a (formula)',
        fn: sum_to_n_a,
        largeTest: 100000
    },
    {
        name: 'sum_to_n_b (iterative)',
        fn: sum_to_n_b,
        largeTest: 100000
    },
    {
        name: 'sum_to_n_c (memoized recursion)',
        fn: sum_to_n_c,
        largeTest: 2000 // SAFE limit tránh stack overflow
    }
];

describe.each(implementations)('$name', ({ fn, largeTest }) => {

    // --- Basic correctness ---
    describe('Basic correctness', () => {
        test('sum_to_n(1) === 1', () => {
            expect(fn(1)).toBe(1);
        });

        test('sum_to_n(5) === 15', () => {
            expect(fn(5)).toBe(15);
        });

        test('sum_to_n(10) === 55', () => {
            expect(fn(10)).toBe(55);
        });

        test('sum_to_n(100) === 5050', () => {
            expect(fn(100)).toBe(5050);
        });
    });

    // --- Edge cases ---
    describe('Edge cases', () => {
        test('sum_to_n(0) === 0', () => {
            expect(fn(0)).toBe(0);
        });

        test('sum_to_n(2) === 3', () => {
            expect(fn(2)).toBe(3);
        });

        test('sum_to_n(3) === 6', () => {
            expect(fn(3)).toBe(6);
        });
    });

    // --- Large numbers (safe per implementation) ---
    describe('Large numbers', () => {
        test(`sum_to_n(${largeTest}) is correct`, () => {
            const result = fn(largeTest);
            const expected = (largeTest * (largeTest + 1)) / 2;

            expect(result).toBe(expected);
            expect(result).toBeLessThanOrEqual(Number.MAX_SAFE_INTEGER);
        });
    });

    // --- Type checks ---
    describe('Return type', () => {
        test('returns a number', () => {
            expect(typeof fn(5)).toBe('number');
        });

        test('returns an integer', () => {
            expect(Number.isInteger(fn(5))).toBe(true);
            expect(Number.isInteger(fn(100))).toBe(true);
        });
    });

    // --- Cross consistency ---
    describe('Cross-implementation consistency', () => {
        const reference = sum_to_n_a;

        [1, 5, 10, 42, 100, 999].forEach((n) => {
            test(`fn(${n}) matches reference formula`, () => {
                expect(fn(n)).toBe(reference(n));
            });
        });
    });
});