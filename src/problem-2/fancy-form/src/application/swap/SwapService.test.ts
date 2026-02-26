import { describe, it, expect, vi, beforeEach } from "vitest";
import { SwapService } from "@/application/swap/SwapService";
import type { Token } from "@/domain/token/entities/Token";

const makeToken = (symbol: string, price: number | null = 100): Token => ({
  symbol,
  name: symbol,
  price,
});

const ETH = makeToken("ETH", 2000);
const USDC = makeToken("USDC", 1);
const NULL_PRICE = makeToken("UNKNOWN", null);

describe("SwapService", () => {
  let service: SwapService;

  beforeEach(() => {
    service = new SwapService();
  });

  // ── validate ──────────────────────────────────────────────────────────────
  describe("validate", () => {
    it("returns null for a valid swap request", () => {
      expect(
        service.validate({ fromToken: ETH, toToken: USDC, fromAmount: "1", toAmount: "2000" })
      ).toBeNull();
    });

    it("returns error when fromToken is missing", () => {
      expect(service.validate({ toToken: USDC, fromAmount: "1" })).toBe("Select tokens");
    });

    it("returns error when toToken is missing", () => {
      expect(service.validate({ fromToken: ETH, fromAmount: "1" })).toBe("Select tokens");
    });

    it("returns error when fromAmount is empty", () => {
      expect(service.validate({ fromToken: ETH, toToken: USDC, fromAmount: "" })).toBe(
        "Enter a valid amount"
      );
    });

    it("returns error when fromAmount is zero", () => {
      expect(service.validate({ fromToken: ETH, toToken: USDC, fromAmount: "0" })).toBe(
        "Enter a valid amount"
      );
    });

    it("returns error when fromAmount is negative", () => {
      expect(service.validate({ fromToken: ETH, toToken: USDC, fromAmount: "-1" })).toBe(
        "Enter a valid amount"
      );
    });

    it("returns error when same token selected", () => {
      expect(
        service.validate({ fromToken: ETH, toToken: ETH, fromAmount: "1" })
      ).toBe("Select different tokens");
    });

    it("returns error when fromToken has no price", () => {
      expect(
        service.validate({ fromToken: NULL_PRICE, toToken: USDC, fromAmount: "1" })
      ).toBe("Price not available for selected token");
    });

    it("returns error when toToken has no price", () => {
      expect(
        service.validate({ fromToken: ETH, toToken: NULL_PRICE, fromAmount: "1" })
      ).toBe("Price not available for selected token");
    });
  });

  // ── computeToAmount ───────────────────────────────────────────────────────
  describe("computeToAmount", () => {
    it("computes correct destination amount", () => {
      expect(service.computeToAmount("1", ETH, USDC)).toBe("2000.000000");
    });

    it("returns empty string when fromToken is null", () => {
      expect(service.computeToAmount("1", null, USDC)).toBe("");
    });

    it("returns empty string when toToken is null", () => {
      expect(service.computeToAmount("1", ETH, null)).toBe("");
    });

    it("returns empty string for empty amount", () => {
      expect(service.computeToAmount("", ETH, USDC)).toBe("");
    });
  });

  // ── computeFromAmount ─────────────────────────────────────────────────────
  describe("computeFromAmount", () => {
    it("computes correct source amount from destination", () => {
      expect(service.computeFromAmount("2000", ETH, USDC)).toBe("1.000000");
    });

    it("returns empty string when fromToken is null", () => {
      expect(service.computeFromAmount("2000", null, USDC)).toBe("");
    });

    it("returns empty string when toToken is null", () => {
      expect(service.computeFromAmount("2000", ETH, null)).toBe("");
    });

    it("returns empty string for empty amount", () => {
      expect(service.computeFromAmount("", ETH, USDC)).toBe("");
    });
  });

  // ── rateLabel ─────────────────────────────────────────────────────────────
  describe("rateLabel", () => {
    it("returns formatted rate string", () => {
      // 2000 / 1 = 2000.000000
      expect(service.rateLabel(ETH, USDC)).toBe("2000.000000");
    });

    it("returns null when fromToken is null", () => {
      expect(service.rateLabel(null, USDC)).toBeNull();
    });

    it("returns null when toToken is null", () => {
      expect(service.rateLabel(ETH, null)).toBeNull();
    });

    it("returns null when fromToken has no price", () => {
      expect(service.rateLabel(NULL_PRICE, USDC)).toBeNull();
    });

    it("returns null when toToken has no price", () => {
      expect(service.rateLabel(ETH, NULL_PRICE)).toBeNull();
    });

    it("returns result with 6 decimal places", () => {
      expect(service.rateLabel(ETH, USDC)).toMatch(/^\d+\.\d{6}$/);
    });
  });

  // ── execute ───────────────────────────────────────────────────────────────
  describe("execute", () => {
    it("resolves with success: true", async () => {
      vi.useFakeTimers();
      const promise = service.execute({
        fromToken: ETH,
        toToken: USDC,
        fromAmount: "1",
        toAmount: "2000",
      });
      await vi.runAllTimersAsync();
      const result = await promise;
      expect(result.success).toBe(true);
      vi.useRealTimers();
    });

    it("returns a txHash on success", async () => {
      vi.useFakeTimers();
      const promise = service.execute({
        fromToken: ETH,
        toToken: USDC,
        fromAmount: "1",
        toAmount: "2000",
      });
      await vi.runAllTimersAsync();
      const result = await promise;
      expect(result.txHash).toBeDefined();
      vi.useRealTimers();
    });
  });
});