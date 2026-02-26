import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useSwap } from "@/presentation/swap/hooks/useSwap";
import * as tokenRepoModule from "@/infrastructure/token/SwitcheoTokenRepository";
import * as swapServiceModule from "@/application/swap/SwapService";
import type { Token } from "@/domain/token/entities/Token";

// ── fixtures ──────────────────────────────────────────────────────────────────
const ETH: Token = { symbol: "ETH", name: "ETH", price: 2000 };
const USDC: Token = { symbol: "USDC", name: "USDC", price: 1 };
const BTC: Token = { symbol: "BTC", name: "BTC", price: 45000 };
const mockTokens = [BTC, ETH, USDC];

// ── mocks ─────────────────────────────────────────────────────────────────────
beforeEach(() => {
  vi.spyOn(tokenRepoModule.tokenRepository, "fetchAll").mockResolvedValue(mockTokens);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers(); // luôn restore real timers sau mỗi test
});

// ── helper: setup phải chạy với real timers ───────────────────────────────────
async function setup() {
  const { result } = renderHook(() => useSwap());
  await waitFor(() => expect(result.current.loading).toBe(false));
  return result;
}

// ── tests ─────────────────────────────────────────────────────────────────────
describe("useSwap – initialisation", () => {
  it("starts in loading state", () => {
    vi.spyOn(tokenRepoModule.tokenRepository, "fetchAll").mockImplementation(
      () => new Promise(() => {})
    );
    const { result } = renderHook(() => useSwap());
    expect(result.current.loading).toBe(true);
  });

  it("sets loading to false after fetch", async () => {
    const result = await setup();
    expect(result.current.loading).toBe(false);
  });

  it("defaults fromToken to ETH", async () => {
    const result = await setup();
    expect(result.current.fromToken?.symbol).toBe("ETH");
  });

  it("defaults toToken to USDC", async () => {
    const result = await setup();
    expect(result.current.toToken?.symbol).toBe("USDC");
  });

  it("populates tokens list from repository", async () => {
    const result = await setup();
    expect(result.current.tokens).toHaveLength(3);
  });

  it("sets error when repository throws", async () => {
    vi.spyOn(tokenRepoModule.tokenRepository, "fetchAll").mockRejectedValue(
      new Error("network")
    );
    const { result } = renderHook(() => useSwap());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Failed to load token prices");
  });
});

describe("useSwap – amount changes", () => {
  it("updates fromAmount and recomputes toAmount", async () => {
    const result = await setup();
    await act(async () => result.current.setFromAmount("1"));
    expect(result.current.fromAmount).toBe("1");
    expect(result.current.toAmount).toBe("2000.000000");
  });

  it("updates toAmount and recomputes fromAmount", async () => {
    const result = await setup();
    await act(async () => result.current.setToAmount("2000"));
    expect(result.current.toAmount).toBe("2000");
    expect(result.current.fromAmount).toBe("1.000000");
  });

  it("clears error and success when amount changes", async () => {
    const result = await setup();
    await act(async () => result.current.submit());
    expect(result.current.error).not.toBe("");
    await act(async () => result.current.setFromAmount("1"));
    expect(result.current.error).toBe("");
    expect(result.current.success).toBe(false);
  });
});

describe("useSwap – token selection", () => {
  it("selectFromToken updates fromToken", async () => {
    const result = await setup();
    await act(async () => result.current.selectFromToken(BTC));
    expect(result.current.fromToken?.symbol).toBe("BTC");
  });

  it("selectToToken updates toToken", async () => {
    const result = await setup();
    await act(async () => result.current.selectToToken(BTC));
    expect(result.current.toToken?.symbol).toBe("BTC");
  });

  it("recomputes toAmount when fromToken changes", async () => {
    const result = await setup();
    await act(async () => result.current.setFromAmount("1"));
    await act(async () => result.current.selectFromToken(BTC));
    expect(result.current.toAmount).toBe("45000.000000");
  });
});

describe("useSwap – flipTokens", () => {
  it("swaps fromToken and toToken", async () => {
    const result = await setup();
    await act(async () => result.current.flipTokens());
    expect(result.current.fromToken?.symbol).toBe("USDC");
    expect(result.current.toToken?.symbol).toBe("ETH");
  });

  it("swaps fromAmount and toAmount", async () => {
    const result = await setup();
    await act(async () => result.current.setFromAmount("1"));
    const prevTo = result.current.toAmount;
    await act(async () => result.current.flipTokens());
    expect(result.current.fromAmount).toBe(prevTo);
  });
});

describe("useSwap – submit", () => {
  it("sets error when submitting with no amount", async () => {
    const result = await setup();
    await act(async () => result.current.submit());
    expect(result.current.error).toBe("Enter a valid amount");
  });

  it("sets error when same tokens selected", async () => {
    const result = await setup();
    await act(async () => result.current.selectToToken(ETH));
    await act(async () => result.current.setFromAmount("1"));
    await act(async () => result.current.submit());
    expect(result.current.error).toBe("Select different tokens");
  });

  it("sets swapping to true during execution", async () => {
    vi.spyOn(swapServiceModule.swapService, "execute").mockImplementation(
      () => new Promise(() => {})
    );
    const result = await setup();
    await act(async () => result.current.setFromAmount("1"));
    act(() => { result.current.submit(); });
    await waitFor(() => expect(result.current.swapping).toBe(true));
  });

  it("sets success and clears amounts on successful swap", async () => {
    // Mock execute trả về ngay lập tức – không cần fake timers
    vi.spyOn(swapServiceModule.swapService, "execute").mockResolvedValue({
      success: true,
      txHash: "0xmock",
    });

    const result = await setup();
    await act(async () => result.current.setFromAmount("1"));
    await act(async () => result.current.submit());

    expect(result.current.success).toBe(true);
    expect(result.current.fromAmount).toBe("");
    expect(result.current.toAmount).toBe("");
  });
});

describe("useSwap – rate", () => {
  it("computes correct rate label", async () => {
    const result = await setup();
    expect(result.current.rate).toBe("2000.000000");
  });

  it("rate changes when token changes", async () => {
    const result = await setup();
    await act(async () => result.current.selectFromToken(BTC));
    expect(result.current.rate).toBe("45000.000000");
  });
});