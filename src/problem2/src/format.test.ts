import { describe, expect, it } from "vitest";
import { AMOUNT_PATTERN, formatUsd, toInputValue } from "./format";

describe("toInputValue", () => {
  it("strips trailing zeros and keeps whole numbers clean", () => {
    expect(toInputValue(10)).toBe("10");
    expect(toInputValue(1.5)).toBe("1.5");
    expect(toInputValue(3292.268272)).toBe("3292.268272");
  });

  it("never uses exponent notation for tiny or large values", () => {
    expect(toInputValue(1e-7)).toBe("0.0000001");
    expect(toInputValue(1.23e-9)).toBe("0.00000000123");
    expect(toInputValue(1e20)).toBe("100000000000000000000");
  });

  it("returns empty for non positive or non finite input", () => {
    expect(toInputValue(0)).toBe("");
    expect(toInputValue(-1)).toBe("");
    expect(toInputValue(NaN)).toBe("");
    expect(toInputValue(Infinity)).toBe("");
  });

  it("collapses values below the precision floor to 0", () => {
    expect(toInputValue(1e-25)).toBe("0");
  });

  it("keeps at least 5 significant digits for small values", () => {
    for (const n of [0.00517163106725, 0.000123456789, 4.56789e-8]) {
      expect(Math.abs(Number(toInputValue(n)) - n) / n).toBeLessThan(1e-4);
    }
  });
});

describe("AMOUNT_PATTERN", () => {
  it.each(["", "0", "12", "12.", ".5", "0.123456789012345678", "123456789012345"])("accepts %j", (v) => {
    expect(AMOUNT_PATTERN.test(v)).toBe(true);
  });

  it.each(["abc", "-1", "1e5", "1.2.3", "1,5", " 1", "1234567890123456", "0.1234567890123456789"])(
    "rejects %j",
    (v) => {
      expect(AMOUNT_PATTERN.test(v)).toBe(false);
    }
  );
});

describe("formatUsd", () => {
  it("formats regular amounts with grouping", () => {
    expect(formatUsd(1645.93)).toBe("$1,645.93");
  });

  it("shows a floor label for sub cent amounts and plain zero for zero", () => {
    expect(formatUsd(0.004)).toBe("<$0.01");
    expect(formatUsd(0)).toBe("$0.00");
  });
});
