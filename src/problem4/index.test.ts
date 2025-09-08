import { sumToNWithLoop, sumToNWithFormula, sumToNWithRecursion, sumToNMemoRecursion } from "./index";

describe("Sum to N functions", () => {
  it("sumToNWithLoop should return correct sum", () => {
    expect(sumToNWithLoop(5)).toBe(15);
    expect(sumToNWithLoop(0)).toBe(0);
  });

  it("sumToNWithFormula should return correct sum", () => {
    expect(sumToNWithFormula(5)).toBe(15);
    expect(sumToNWithFormula(0)).toBe(0);
  });

  it("sumToNWithRecursion should return correct sum", () => {
    expect(sumToNWithRecursion(5)).toBe(15);
    expect(sumToNWithRecursion(0)).toBe(0);
  });

  it("sumToNMemoRecursion should return correct sum", () => {
    expect(sumToNMemoRecursion(5)).toBe(15);
    expect(sumToNMemoRecursion(0)).toBe(0);
  });

  it("should throw error if result exceeds Number.MAX_SAFE_INTEGER", () => {
    // Find n such that (n * (n + 1)) / 2 > Number.MAX_SAFE_INTEGER
    const unsafeN = Math.floor((Math.sqrt(8 * Number.MAX_SAFE_INTEGER + 1) - 1) / 2) + 1;
    expect(() => sumToNWithLoop(unsafeN)).toThrow('Result exceeds Number.MAX_SAFE_INTEGER');
    expect(() => sumToNWithFormula(unsafeN)).toThrow('Result exceeds Number.MAX_SAFE_INTEGER');
    expect(() => sumToNWithRecursion(unsafeN)).toThrow('Result exceeds Number.MAX_SAFE_INTEGER');
    expect(() => sumToNMemoRecursion(unsafeN)).toThrow('Result exceeds Number.MAX_SAFE_INTEGER');
  });
});
