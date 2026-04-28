import { sum_to_n_a, sum_to_n_b, sum_to_n_c } from "../src/sum";

describe("Sum to n", () => {
  const testCases = [
    { input: 0, expected: 0 },
    { input: 1, expected: 1 },
    { input: 5, expected: 15 },
    { input: 10, expected: 55 },
  ];

  testCases.forEach(({ input, expected }) => {
    test(`n = ${input}`, () => {
      expect(sum_to_n_a(input)).toBe(expected);
      expect(sum_to_n_b(input)).toBe(expected);
      expect(sum_to_n_c(input)).toBe(expected);
    });
  });
});
