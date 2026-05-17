import { describe, it, expect } from "vitest";
import { sanitizeAmount, formatAmount, formatUsd, formatDisplayNumber } from "./tokens";

describe("sanitizeAmount", () => {
  it("keeps a plain integer", () => {
    expect(sanitizeAmount("123")).toBe("123");
  });
  it("keeps one decimal point", () => {
    expect(sanitizeAmount("1.5")).toBe("1.5");
  });
  it("strips non-numeric characters", () => {
    expect(sanitizeAmount("1a2b3c")).toBe("123");
  });
  it("collapses repeated decimal points", () => {
    expect(sanitizeAmount("1.2.3")).toBe("1.23");
  });
  it("caps at 8 decimal places", () => {
    expect(sanitizeAmount("0.123456789012")).toBe("0.12345678");
  });
  it("strips leading zeros from integers", () => {
    expect(sanitizeAmount("0005")).toBe("5");
  });
  it("preserves 0.5", () => {
    expect(sanitizeAmount("0.5")).toBe("0.5");
  });
  it("preserves a lone 0", () => {
    expect(sanitizeAmount("0")).toBe("0");
  });
  it("rewrites a leading dot to 0.", () => {
    expect(sanitizeAmount(".5")).toBe("0.5");
  });
  it("handles empty input", () => {
    expect(sanitizeAmount("")).toBe("");
  });
});

describe("formatAmount", () => {
  it("returns '0' for zero", () => {
    expect(formatAmount(0)).toBe("0");
  });
  it("returns '0' for NaN", () => {
    expect(formatAmount(NaN)).toBe("0");
  });
  it("strips trailing zeros", () => {
    expect(formatAmount(1.5)).toBe("1.5");
    expect(formatAmount(3200)).toBe("3200");
  });
  it("respects 8 decimal cap", () => {
    expect(formatAmount(0.123456789)).toBe("0.12345679");
  });
});

describe("formatUsd", () => {
  it("formats with $ and two decimals", () => {
    expect(formatUsd(3200)).toBe("$3,200.00");
  });
});

describe("formatDisplayNumber", () => {
  it("groups thousands", () => {
    expect(formatDisplayNumber(3200)).toBe("3,200");
  });
});
