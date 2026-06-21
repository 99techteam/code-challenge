import { sum_to_n_a, sum_to_n_b, sum_to_n_c } from "./sum_to_n.js";

describe('sum_to_n implementations', () => {
  const functions = [sum_to_n_a, sum_to_n_b, sum_to_n_c];

  functions.forEach((func) => {
    describe(`${func.name}`, () => {
      
      test('sums positive integers correctly (1 to 5)', () => {
        expect(func(5)).toBe(15);
      });

      test('handles the base case of 1', () => {
        expect(func(1)).toBe(1);
      });

      test('returns 0 for 0', () => {
        expect(func(0)).toBe(0);
      });

      test('handles negative integers correctly (-5 to -1)', () => {
        expect(func(-5)).toBe(-15);
      });

      test('sanitizes decimal inputs (truncates 5.9 to 5)', () => {
        expect(func(5.9)).toBe(15);
      });

      test('handles negative decimal inputs (-5.9 to -5)', () => {
        expect(func(-5.9)).toBe(-15);
      });

      test('handles large numbers (within MAX_SAFE_INTEGER)', () => {
        // sum of 1..100 = 5050
        expect(func(100)).toBe(5050);
      });
    });
  });
});