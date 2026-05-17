import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { usePrices } from "./usePrices";

const SAMPLE = [
  { currency: "BUSD", date: "2023-08-29T07:10:40.000Z", price: 0.999 },
  { currency: "BUSD", date: "2023-08-29T07:11:40.000Z", price: 1.001 },
  { currency: "ETH", date: "2023-08-29T07:10:52.000Z", price: 1645.93 },
  { currency: "USDC", date: "2023-08-29T07:10:40.000Z", price: 1 },
  { currency: "BROKEN", date: "2023-08-29T07:10:40.000Z", price: 0 },
  { currency: "NULLY", date: "2023-08-29T07:10:40.000Z", price: null },
];

describe("usePrices", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(SAMPLE),
        } as Response),
      ),
    );
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("starts in loading state", () => {
    const { result } = renderHook(() => usePrices());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.tokens).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("returns deduped tokens sorted by symbol after fetch resolves", async () => {
    const { result } = renderHook(() => usePrices());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const symbols = result.current.tokens.map((t) => t.symbol);
    expect(symbols).toEqual(["BUSD", "ETH", "USDC"]);

    const busd = result.current.tokens.find((t) => t.symbol === "BUSD")!;
    expect(busd.price).toBe(1.001);
  });

  it("attaches an icon URL to each token", async () => {
    const { result } = renderHook(() => usePrices());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const eth = result.current.tokens.find((t) => t.symbol === "ETH")!;
    expect(eth.iconUrl).toBe(
      "https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/ETH.svg",
    );
  });

  it("filters out tokens with falsy or non-finite prices", async () => {
    const { result } = renderHook(() => usePrices());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const symbols = result.current.tokens.map((t) => t.symbol);
    expect(symbols).not.toContain("BROKEN");
    expect(symbols).not.toContain("NULLY");
  });

  it("surfaces a network error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new Error("offline"))),
    );
    const { result } = renderHook(() => usePrices());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.tokens).toEqual([]);
  });

  it("retry() re-runs the fetch", async () => {
    let calls = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(() => {
        calls += 1;
        if (calls === 1) return Promise.reject(new Error("offline"));
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(SAMPLE),
        } as Response);
      }),
    );
    const { result } = renderHook(() => usePrices());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeInstanceOf(Error);

    result.current.retry();
    await waitFor(() => expect(result.current.error).toBeNull());
    expect(result.current.tokens.length).toBeGreaterThan(0);
  });
});
