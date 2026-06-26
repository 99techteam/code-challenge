import { describe, it, expect } from "vitest";
import { computeReceiveAmount, formatAmount, formatRate } from "./format";

describe("computeReceiveAmount", () => {
  it("calculates the correct ratio", () => {
    // 10 ETH at $1800 each → how many USDC at $1/each
    expect(computeReceiveAmount(10, 1800, 1)).toBe(18000);
  });

  it("works when fromPrice > toPrice", () => {
    // 1 BTC ($26000) → ETH ($1800): should receive ~14.44 ETH
    expect(computeReceiveAmount(1, 26000, 1800)).toBeCloseTo(14.444, 3);
  });

  it("returns 0 when toPrice is zero", () => {
    expect(computeReceiveAmount(100, 1800, 0)).toBe(0);
  });

  it("returns 0 when fromPrice is zero", () => {
    expect(computeReceiveAmount(100, 0, 1800)).toBe(0);
  });

  it("returns 0 when sendAmount is zero", () => {
    expect(computeReceiveAmount(0, 1800, 1)).toBe(0);
  });
});

describe("formatAmount", () => {
  it("formats with at least 2 decimal places", () => {
    expect(formatAmount(1.5)).toBe("1.50");
  });

  it("preserves up to 6 significant decimal places", () => {
    expect(formatAmount(0.123456)).toBe("0.123456");
  });

  it("adds thousands separators", () => {
    expect(formatAmount(1234567.89)).toBe("1,234,567.89");
  });
});

describe("formatRate", () => {
  it("returns a readable exchange rate string", () => {
    // 1 ETH ≈ 1800 USDC
    expect(formatRate("ETH", "USDC", 1800, 1)).toBe("1 ETH ≈ 1,800.00 USDC");
  });

  it("returns an em dash when toPrice is zero", () => {
    expect(formatRate("ETH", "USDC", 1800, 0)).toBe("—");
  });
});
