import { sum_to_n_a, sum_to_n_b, sum_to_n_c } from "../src/sum_to_n";

describe("sum_to_n_*", () => {
  const testCases = [
    { input: 1, expected: 1 },
    { input: 5, expected: 15 },
    { input: 100, expected: 5050 },
  ];

  testCases.forEach(({ input, expected }) => {
    test(`sum_to_n_a(${input}) = ${expected}`, () => {
      expect(sum_to_n_a(input)).toBe(expected);
    });

    test(`sum_to_n_b(${input}) = ${expected}`, () => {
      expect(sum_to_n_b(input)).toBe(expected);
    });

    test(`sum_to_n_c(${input}) = ${expected}`, () => {
      expect(sum_to_n_c(input)).toBe(expected);
    });
  });
});
