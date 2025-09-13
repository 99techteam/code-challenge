import { sum_to_n_a, sum_to_n_b, sum_to_n_c } from './solution';

/**
 * Jest Test Suite for Problem 4: Sum to N - Three Implementations
 */

describe('Sum to N Implementations', () => {
    // Test data with expected results
    const testCases = [
        { input: 0, expected: 0, description: 'zero input' },
        { input: 1, expected: 1, description: 'single number' },
        { input: 5, expected: 15, description: 'small positive number' },
        { input: 10, expected: 55, description: 'medium positive number' },
        { input: 100, expected: 5050, description: 'large positive number' },
        { input: -5, expected: 0, description: 'negative input' },
        { input: -1, expected: 0, description: 'negative single number' },
    ];

    describe('Implementation A: Mathematical Formula (Gauss)', () => {
        test.each(testCases)('should return $expected for input $input ($description)', ({ input, expected }) => {
            expect(sum_to_n_a(input)).toBe(expected);
        });

        test('should have O(1) time complexity', () => {
            // Performance test - all these should complete very quickly
            const start = performance.now();
            sum_to_n_a(1000000);
            const end = performance.now();
            
            // Should complete in well under 1ms
            expect(end - start).toBeLessThan(1);
        });
    });

    describe('Implementation B: Iterative Approach', () => {
        test.each(testCases)('should return $expected for input $input ($description)', ({ input, expected }) => {
            expect(sum_to_n_b(input)).toBe(expected);
        });

        test('should handle reasonable large numbers', () => {
            expect(sum_to_n_b(1000)).toBe(500500);
        });
    });

    describe('Implementation C: Recursive Approach', () => {
        test.each(testCases)('should return $expected for input $input ($description)', ({ input, expected }) => {
            expect(sum_to_n_c(input)).toBe(expected);
        });

        test('should handle moderate numbers without stack overflow', () => {
            expect(sum_to_n_c(100)).toBe(5050);
        });

        // Note: We don't test very large numbers here to avoid stack overflow
    });

    describe('All Implementations Consistency', () => {
        test.each(testCases)('all implementations should return same result for input $input', ({ input }) => {
            const resultA = sum_to_n_a(input);
            const resultB = sum_to_n_b(input);
            const resultC = sum_to_n_c(input);

            expect(resultA).toBe(resultB);
            expect(resultB).toBe(resultC);
            expect(resultA).toBe(resultC);
        });

        test('all implementations should match for various inputs', () => {
            const testInputs = [0, 1, 2, 3, 4, 5, 10, 20, 50];
            
            testInputs.forEach(n => {
                const resultA = sum_to_n_a(n);
                const resultB = sum_to_n_b(n);
                const resultC = sum_to_n_c(n);
                
                expect(resultA).toBe(resultB);
                expect(resultB).toBe(resultC);
            });
        });
    });

    describe('Edge Cases', () => {
        test('should handle zero correctly', () => {
            expect(sum_to_n_a(0)).toBe(0);
            expect(sum_to_n_b(0)).toBe(0);
            expect(sum_to_n_c(0)).toBe(0);
        });

        test('should handle negative numbers by returning 0', () => {
            const negativeInputs = [-1, -5, -10, -100];
            
            negativeInputs.forEach(n => {
                expect(sum_to_n_a(n)).toBe(0);
                expect(sum_to_n_b(n)).toBe(0);
                expect(sum_to_n_c(n)).toBe(0);
            });
        });

        test('should handle decimal inputs (noted behavior differences)', () => {
            // Note: Different implementations may handle decimals differently
            // This is expected behavior - we just document what happens
            
            const decimalInput = 5.5; // Use simpler decimal
            const formulaResult = sum_to_n_a(decimalInput);
            const iterativeResult = sum_to_n_b(decimalInput);
            const recursiveResult = sum_to_n_c(decimalInput);
            
            // All should return numeric results
            expect(typeof formulaResult).toBe('number');
            expect(typeof iterativeResult).toBe('number');
            expect(typeof recursiveResult).toBe('number');
            
            // Formula result should be greater than integer version
            expect(formulaResult).toBeGreaterThan(sum_to_n_a(5));
        });
    });

    describe('Mathematical Properties', () => {
        test('should satisfy the triangular number formula', () => {
            // For any n, sum_to_n(n) should equal n*(n+1)/2
            const testValues = [1, 5, 10, 20, 50];
            
            testValues.forEach(n => {
                const expected = (n * (n + 1)) / 2;
                expect(sum_to_n_a(n)).toBe(expected);
                expect(sum_to_n_b(n)).toBe(expected);
                expect(sum_to_n_c(n)).toBe(expected);
            });
        });

        test('should be monotonically increasing for positive inputs', () => {
            for (let i = 1; i < 10; i++) {
                expect(sum_to_n_a(i + 1)).toBeGreaterThan(sum_to_n_a(i));
                expect(sum_to_n_b(i + 1)).toBeGreaterThan(sum_to_n_b(i));
                expect(sum_to_n_c(i + 1)).toBeGreaterThan(sum_to_n_c(i));
            }
        });
    });

    describe('Performance Comparison', () => {
        test('formula approach should be fastest', () => {
            const n = 10000;
            
            const startA = performance.now();
            sum_to_n_a(n);
            const timeA = performance.now() - startA;
            
            const startB = performance.now();
            sum_to_n_b(n);
            const timeB = performance.now() - startB;
            
            // Formula should be significantly faster than iterative
            expect(timeA).toBeLessThan(timeB);
        });
    });
});