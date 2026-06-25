import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchTokens } from "./prices";

const ICON_BASE =
  "https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens";

// Helper to mock the global fetch with a fixed JSON payload.
function mockFetch(records: object[]) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(records),
    })
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchTokens", () => {
  it("keeps only the most recent record when a currency appears multiple times", async () => {
    mockFetch([
      { currency: "ETH", date: "2023-08-29T00:00:00.000Z", price: 1800 },
      { currency: "ETH", date: "2023-08-30T00:00:00.000Z", price: 1850 }, // newer
    ]);

    const tokens = await fetchTokens();
    expect(tokens).toHaveLength(1);
    expect(tokens[0].price).toBe(1850);
  });

  it("drops tokens with price <= 0", async () => {
    mockFetch([
      { currency: "ETH", date: "2023-08-29T00:00:00.000Z", price: 1800 },
      { currency: "ZERO", date: "2023-08-29T00:00:00.000Z", price: 0 },
    ]);

    const tokens = await fetchTokens();
    expect(tokens.map((t) => t.symbol)).not.toContain("ZERO");
  });

  it("returns tokens sorted alphabetically by symbol", async () => {
    mockFetch([
      { currency: "ETH", date: "2023-08-29T00:00:00.000Z", price: 1800 },
      { currency: "BTC", date: "2023-08-29T00:00:00.000Z", price: 26000 },
      { currency: "ATOM", date: "2023-08-29T00:00:00.000Z", price: 8 },
    ]);

    const symbols = (await fetchTokens()).map((t) => t.symbol);
    expect(symbols).toEqual(["ATOM", "BTC", "ETH"]);
  });

  it("builds the correct icon URL for each token", async () => {
    mockFetch([
      { currency: "ETH", date: "2023-08-29T00:00:00.000Z", price: 1800 },
    ]);

    const tokens = await fetchTokens();
    expect(tokens[0].iconUrl).toBe(`${ICON_BASE}/ETH.svg`);
  });

  it("throws when the network response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 })
    );

    await expect(fetchTokens()).rejects.toThrow("HTTP 500");
  });
});
