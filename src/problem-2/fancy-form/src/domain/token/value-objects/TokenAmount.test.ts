import { describe, it, expect } from "vitest";
import { TokenAmount } from "@/domain/token/value-objects/TokenAmount";
import type { Token } from "@/domain/token/entities/Token";

const makeToken = (symbol: string, price: number | null = 100): Token => ({
  symbol,
  name: symbol,
  price,
});

const ETH = makeToken("ETH", 2000);
const USDC = makeToken("USDC", 1);
const NULL_PRICE = makeToken("UNKNOWN", null);

describe("TokenAmount.of", () => {
  it("creates a TokenAmount with given raw and token", () => {
    const ta = TokenAmount.of("1.5", ETH);
    expect(ta.raw).toBe("1.5");
    expect(ta.token).toBe(ETH);
  });
});

describe("TokenAmount.numeric", () => {
  it("parses a valid number string", () => {
    expect(TokenAmount.numeric(TokenAmount.of("1.5", ETH))).toBe(1.5);
  });

  it("returns 0 for empty string", () => {
    expect(TokenAmount.numeric(TokenAmount.of("", ETH))).toBe(0);
  });

  it("returns 0 for non-numeric string", () => {
    expect(TokenAmount.numeric(TokenAmount.of("abc", ETH))).toBe(0);
  });
});

describe("TokenAmount.isValid", () => {
  it("returns true for a positive number string", () => {
    expect(TokenAmount.isValid(TokenAmount.of("1", ETH))).toBe(true);
  });

  it("returns false for zero", () => {
    expect(TokenAmount.isValid(TokenAmount.of("0", ETH))).toBe(false);
  });

  it("returns false for negative value", () => {
    expect(TokenAmount.isValid(TokenAmount.of("-1", ETH))).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(TokenAmount.isValid(TokenAmount.of("", ETH))).toBe(false);
  });

  it("returns false for non-numeric string", () => {
    expect(TokenAmount.isValid(TokenAmount.of("abc", ETH))).toBe(false);
  });
});

describe("TokenAmount.usdValue", () => {
  it("returns numeric * token.price", () => {
    expect(TokenAmount.usdValue(TokenAmount.of("2", ETH))).toBe(4000);
  });

  it("returns null when token has no price", () => {
    expect(TokenAmount.usdValue(TokenAmount.of("2", NULL_PRICE))).toBeNull();
  });

  it("returns 0 when raw is empty", () => {
    expect(TokenAmount.usdValue(TokenAmount.of("", ETH))).toBe(0);
  });
});

describe("TokenAmount.convertTo", () => {
  it("correctly converts ETH → USDC", () => {
    // 1 ETH @ $2000, 1 USDC @ $1  →  2000 USDC
    const result = TokenAmount.convertTo(TokenAmount.of("1", ETH), USDC);
    expect(result).toBe("2000.000000");
  });

  it("correctly converts USDC → ETH", () => {
    // 2000 USDC @ $1, 1 ETH @ $2000  →  1 ETH
    const result = TokenAmount.convertTo(TokenAmount.of("2000", USDC), ETH);
    expect(result).toBe("1.000000");
  });

  it("returns null when source token has no price", () => {
    expect(TokenAmount.convertTo(TokenAmount.of("1", NULL_PRICE), USDC)).toBeNull();
  });

  it("returns null when target token has no price", () => {
    expect(TokenAmount.convertTo(TokenAmount.of("1", ETH), NULL_PRICE)).toBeNull();
  });

  it("returns null for empty raw amount", () => {
    expect(TokenAmount.convertTo(TokenAmount.of("", ETH), USDC)).toBeNull();
  });

  it("returns null for non-numeric raw amount", () => {
    expect(TokenAmount.convertTo(TokenAmount.of("abc", ETH), USDC)).toBeNull();
  });

  it("handles decimal amounts correctly", () => {
    // 0.5 ETH → 1000 USDC
    const result = TokenAmount.convertTo(TokenAmount.of("0.5", ETH), USDC);
    expect(result).toBe("1000.000000");
  });

  it("returns result with 6 decimal places", () => {
    const result = TokenAmount.convertTo(TokenAmount.of("1", ETH), USDC);
    expect(result).toMatch(/^\d+\.\d{6}$/);
  });
});