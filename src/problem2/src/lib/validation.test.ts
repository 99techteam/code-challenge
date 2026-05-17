import { describe, it, expect } from "vitest";
import { validate } from "./validation";
import type { SwapState, Token } from "../types";

const ETH: Token = { symbol: "ETH", price: 3200, iconUrl: "" };
const USDC: Token = { symbol: "USDC", price: 1, iconUrl: "" };

function state(overrides: Partial<SwapState> = {}): SwapState {
  return {
    fromToken: ETH,
    toToken: USDC,
    fromAmount: "1",
    toAmount: "3200",
    lastEdited: "from",
    touched: { from: true, to: true },
    status: "idle",
    ...overrides,
  };
}

describe("validate", () => {
  it("returns valid for a well-formed state", () => {
    const r = validate(state());
    expect(r.isValid).toBe(true);
    expect(r.errors).toEqual({});
    expect(r.firstError).toBeNull();
  });

  it("flags missing fromToken", () => {
    const r = validate(state({ fromToken: null }));
    expect(r.isValid).toBe(false);
    expect(r.errors.fromToken).toMatch(/select a token/i);
  });

  it("flags missing toToken", () => {
    const r = validate(state({ toToken: null }));
    expect(r.isValid).toBe(false);
    expect(r.errors.toToken).toMatch(/select a token/i);
  });

  it("flags identical tokens", () => {
    const r = validate(state({ toToken: ETH }));
    expect(r.isValid).toBe(false);
    expect(r.errors.pair).toMatch(/cannot swap a token for itself/i);
  });

  it("flags empty amount", () => {
    const r = validate(state({ fromAmount: "" }));
    expect(r.isValid).toBe(false);
    expect(r.errors.fromAmount).toMatch(/greater than 0/i);
  });

  it("flags zero amount", () => {
    const r = validate(state({ fromAmount: "0" }));
    expect(r.isValid).toBe(false);
    expect(r.errors.fromAmount).toMatch(/greater than 0/i);
  });

  it("flags non-numeric amount", () => {
    const r = validate(state({ fromAmount: "abc" }));
    expect(r.isValid).toBe(false);
    expect(r.errors.fromAmount).toMatch(/greater than 0/i);
  });

  it("flags absurdly large amount", () => {
    const r = validate(state({ fromAmount: "1e16" }));
    expect(r.isValid).toBe(false);
    expect(r.errors.fromAmount).toMatch(/too large/i);
  });

  it("firstError returns the first non-empty error", () => {
    const r = validate(state({ fromToken: null, fromAmount: "" }));
    expect(r.firstError).toMatch(/select a token/i);
  });

  it("validates the To side when lastEdited is 'to'", () => {
    const r = validate(
      state({
        fromAmount: "0",
        toAmount: "0",
        lastEdited: "to",
      }),
    );
    expect(r.isValid).toBe(false);
    expect(r.errors.fromAmount).toMatch(/greater than 0/i);
  });
});
