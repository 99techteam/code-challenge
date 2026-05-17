import { describe, it, expect } from "vitest";
import { swapReducer, initialSwapState } from "./useSwapReducer";
import type { Token } from "../types";

const ETH: Token = { symbol: "ETH", price: 3200, iconUrl: "" };
const USDC: Token = { symbol: "USDC", price: 1, iconUrl: "" };
const BTC: Token = { symbol: "BTC", price: 60000, iconUrl: "" };

const start = initialSwapState(ETH, USDC);

describe("swapReducer", () => {
  describe("initialSwapState", () => {
    it("pre-fills tokens when both provided", () => {
      expect(start.fromToken).toBe(ETH);
      expect(start.toToken).toBe(USDC);
      expect(start.fromAmount).toBe("");
      expect(start.toAmount).toBe("");
      expect(start.lastEdited).toBe("from");
      expect(start.status).toBe("idle");
      expect(start.touched).toEqual({ from: false, to: false });
    });

    it("handles missing default tokens", () => {
      const s = initialSwapState(null, null);
      expect(s.fromToken).toBeNull();
      expect(s.toToken).toBeNull();
    });
  });

  describe("SET_FROM_AMOUNT", () => {
    it("sets fromAmount and recomputes toAmount", () => {
      const s = swapReducer(start, { type: "SET_FROM_AMOUNT", value: "1" });
      expect(s.fromAmount).toBe("1");
      expect(s.toAmount).toBe("3200");
      expect(s.lastEdited).toBe("from");
    });

    it("clears toAmount when fromAmount is empty", () => {
      const s = swapReducer(start, { type: "SET_FROM_AMOUNT", value: "" });
      expect(s.fromAmount).toBe("");
      expect(s.toAmount).toBe("");
    });
  });

  describe("SET_TO_AMOUNT", () => {
    it("sets toAmount and recomputes fromAmount, flips lastEdited", () => {
      const s = swapReducer(start, { type: "SET_TO_AMOUNT", value: "3200" });
      expect(s.toAmount).toBe("3200");
      expect(s.fromAmount).toBe("1");
      expect(s.lastEdited).toBe("to");
    });
  });

  describe("SET_FROM_TOKEN", () => {
    it("changes fromToken and re-derives the non-driven side", () => {
      const seeded = swapReducer(start, { type: "SET_FROM_AMOUNT", value: "1" });
      const s = swapReducer(seeded, { type: "SET_FROM_TOKEN", token: BTC });
      expect(s.fromToken).toBe(BTC);
      expect(s.fromAmount).toBe("1");
      expect(s.toAmount).toBe("60000");
    });

    it("when lastEdited='to', re-derives fromAmount instead", () => {
      const seeded = swapReducer(start, { type: "SET_TO_AMOUNT", value: "60000" });
      const s = swapReducer(seeded, { type: "SET_FROM_TOKEN", token: BTC });
      expect(s.toAmount).toBe("60000");
      expect(s.fromAmount).toBe("1");
    });
  });

  describe("FLIP", () => {
    it("swaps tokens, amounts, and lastEdited", () => {
      const seeded = swapReducer(start, { type: "SET_FROM_AMOUNT", value: "1" });
      const s = swapReducer(seeded, { type: "FLIP" });
      expect(s.fromToken).toBe(USDC);
      expect(s.toToken).toBe(ETH);
      expect(s.fromAmount).toBe("3200");
      expect(s.toAmount).toBe("1");
      expect(s.lastEdited).toBe("to");
    });
  });

  describe("BLUR_FROM / BLUR_TO", () => {
    it("marks touched.from on BLUR_FROM", () => {
      const s = swapReducer(start, { type: "BLUR_FROM" });
      expect(s.touched.from).toBe(true);
      expect(s.touched.to).toBe(false);
    });
    it("marks touched.to on BLUR_TO", () => {
      const s = swapReducer(start, { type: "BLUR_TO" });
      expect(s.touched.to).toBe(true);
    });
  });

  describe("SUBMIT_START / RESET", () => {
    it("SUBMIT_START sets status to submitting", () => {
      const s = swapReducer(start, { type: "SUBMIT_START" });
      expect(s.status).toBe("submitting");
    });

    it("RESET clears amounts but keeps token selections", () => {
      const seeded = swapReducer(start, { type: "SET_FROM_AMOUNT", value: "1" });
      const submitted = swapReducer(seeded, { type: "SUBMIT_START" });
      const s = swapReducer(submitted, { type: "RESET" });
      expect(s.fromAmount).toBe("");
      expect(s.toAmount).toBe("");
      expect(s.fromToken).toBe(ETH);
      expect(s.toToken).toBe(USDC);
      expect(s.status).toBe("idle");
      expect(s.touched).toEqual({ from: false, to: false });
    });
  });

  describe("SET_TO_TOKEN when one token is null", () => {
    it("derives nothing if other side is missing", () => {
      const empty = initialSwapState(null, null);
      const s1 = swapReducer(empty, { type: "SET_FROM_AMOUNT", value: "1" });
      expect(s1.fromAmount).toBe("1");
      expect(s1.toAmount).toBe("");
      const s2 = swapReducer(s1, { type: "SET_FROM_TOKEN", token: ETH });
      expect(s2.toAmount).toBe("");
    });
  });
});
