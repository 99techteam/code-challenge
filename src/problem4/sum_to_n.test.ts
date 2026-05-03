import { describe, it, expect } from "vitest";
import { sumToN_iter, sumToN_formula, sumToN_reduce } from "./sum_to_n";

const impls = [
  ["iter", sumToN_iter],
  ["formula", sumToN_formula],
  ["reduce", sumToN_reduce],
] as const;

describe("sum_to_n — contract", () => {
  for (const [label, fn] of impls) {
    describe(label, () => {
      it.each([
        [0, 0],
        [1, 1],
        [5, 15],
        [10, 55],
        [100, 5050],
        [-1, -1],
        [-3, -6],
        [-100, -5050],
      ])("sum_to_n(%i) === %i", (input, expected) => {
        expect(fn(input)).toBe(expected);
      });

      it("rejects non-integers", () => {
        expect(() => fn(1.5)).toThrow(TypeError);
        expect(() => fn(Number.NaN)).toThrow(TypeError);
      });
    });
  }
});

describe("sum_to_n — implementations agree", () => {
  it.each([0, 1, 7, 42, 1000, -1, -42, -1000])(
    "all three impls agree for n=%i",
    (n) => {
      const a = sumToN_iter(n);
      const b = sumToN_formula(n);
      const c = sumToN_reduce(n);
      expect(b).toBe(a);
      expect(c).toBe(a);
    },
  );
});

describe("sum_to_n — formula overflow guard", () => {
  // Threshold: m_max = floor((sqrt(8*MAX_SAFE + 1) - 1) / 2) = 134_217_727
  const M_MAX = Math.floor(
    (Math.sqrt(8 * Number.MAX_SAFE_INTEGER + 1) - 1) / 2,
  );

  it("accepts the largest safe |n|", () => {
    const result = sumToN_formula(M_MAX);
    expect(Number.isSafeInteger(result)).toBe(true);
  });

  it("rejects one above the safe threshold", () => {
    expect(() => sumToN_formula(M_MAX + 1)).toThrow(RangeError);
  });

  it("rejects clearly oversized input", () => {
    expect(() => sumToN_formula(2 ** 30)).toThrow(RangeError);
  });
});
