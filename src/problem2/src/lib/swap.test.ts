import { describe, it, expect } from "vitest";
import { convert } from "./swap";

describe("convert", () => {
  it("returns 0 for zero amountIn", () => {
    expect(convert(0, 1, 1)).toBe(0);
  });

  it("returns the same amount when prices are identical", () => {
    expect(convert(1.5, 100, 100)).toBe(1.5);
  });

  it("converts 1 ETH at $3200 to 3200 USDC at $1", () => {
    expect(convert(1, 3200, 1)).toBe(3200);
  });

  it("converts 3200 USDC at $1 to 1 ETH at $3200", () => {
    expect(convert(3200, 1, 3200)).toBe(1);
  });

  it("handles fractional prices", () => {
    expect(convert(100, 0.2, 2)).toBe(10);
  });

  it("returns 0 when toPrice is 0 or invalid (guard)", () => {
    expect(convert(10, 1, 0)).toBe(0);
    expect(convert(10, 1, NaN)).toBe(0);
  });

  it("returns 0 when amountIn or fromPrice is invalid", () => {
    expect(convert(NaN, 1, 1)).toBe(0);
    expect(convert(10, NaN, 1)).toBe(0);
  });

  it("handles very large values without overflow", () => {
    expect(convert(1e10, 3200, 1)).toBe(3.2e13);
  });

  it("handles very small values", () => {
    expect(convert(1e-6, 3200, 1)).toBeCloseTo(3.2e-3, 10);
  });
});
