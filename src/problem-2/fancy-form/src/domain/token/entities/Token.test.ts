import { describe, it, expect } from "vitest";
import { isSameToken } from "@/domain/token/entities/Token";
import type { Token } from "@/domain/token/entities/Token";

const makeToken = (symbol: string, price: number | null = 100): Token => ({
  symbol,
  name: symbol,
  price,
});

describe("isSameToken", () => {
  it("returns true when both tokens have the same symbol", () => {
    expect(isSameToken(makeToken("ETH"), makeToken("ETH"))).toBe(true);
  });

  it("returns false when tokens have different symbols", () => {
    expect(isSameToken(makeToken("ETH"), makeToken("USDC"))).toBe(false);
  });

  it("is case-sensitive", () => {
    expect(isSameToken(makeToken("eth"), makeToken("ETH"))).toBe(false);
  });

  it("ignores price when comparing", () => {
    expect(isSameToken(makeToken("ETH", 100), makeToken("ETH", 999))).toBe(true);
  });

  it("ignores null price when comparing", () => {
    expect(isSameToken(makeToken("ETH", null), makeToken("ETH", 100))).toBe(true);
  });
});