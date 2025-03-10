import { sum_to_n_a, sum_to_n_b, sum_to_n_c } from './sum_to_n';

describe('Sum to N Functions', () => {
  const testCases = [
    { n: 1, expected: 1 },
    { n: 5, expected: 15 },
    { n: 10, expected: 55 },
    { n: 100, expected: 5050 },
    { n: 1000, expected: 500500 }
  ];

  testCases.forEach(({ n, expected }) => {
    test(`sum_to_n_a(${n}) should return ${expected}`, () => {
      expect(sum_to_n_a(n)).toBe(expected);
    });

    test(`sum_to_n_b(${n}) should return ${expected}`, () => {
      expect(sum_to_n_b(n)).toBe(expected);
    });

    test(`sum_to_n_c(${n}) should return ${expected}`, () => {
      expect(sum_to_n_c(n)).toBe(expected);
    });
  });
});
