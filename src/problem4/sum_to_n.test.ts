import { describe, expect, it, vi } from "vitest";
import { sum_to_n_a, sum_to_n_b, sum_to_n_c } from "./sum_to_n.js";

describe("sum_to_n", () => {
  const cases: { n: number; expected: number }[] = [
    { n: 5, expected: 15 },
    { n: 0, expected: 0 },
    { n: 1, expected: 1 },
    { n: 100, expected: 5050 },
  ];

  for (const { n, expected } of cases) {
    it(`sum_to_n_a(${n}) === ${expected}`, () => {
      expect(sum_to_n_a(n)).toBe(expected);
    });
    it(`sum_to_n_b(${n}) === ${expected}`, () => {
      expect(sum_to_n_b(n)).toBe(expected);
    });
    it(`sum_to_n_c(${n}) === ${expected}`, () => {
      expect(sum_to_n_c(n)).toBe(expected);
    });
  }

  it("implementations agree for several values", () => {
    for (const n of [0, 1, 2, 10, 50, 123]) {
      const a = sum_to_n_a(n);
      expect(sum_to_n_b(n)).toBe(a);
      expect(sum_to_n_c(n)).toBe(a);
    }
  });

  it("logs to console.error and throws RangeError when n < 0", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    for (const fn of [sum_to_n_a, sum_to_n_b, sum_to_n_c] as const) {
      expect(() => fn(-1)).toThrow(RangeError);
      expect(() => fn(-1)).toThrow(/non-negative/);
    }

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
