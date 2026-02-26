import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SwitcheoTokenRepository } from "@/infrastructure/token/SwitcheoTokenRepository";

const mockPrices = [
  { currency: "ETH", date: "2024-01-01T00:00:00Z", price: 2000 },
  { currency: "USDC", date: "2024-01-01T00:00:00Z", price: 1 },
  { currency: "BTC", date: "2024-01-01T00:00:00Z", price: 45000 },
  // Duplicate ETH with older date – should keep first encountered
  { currency: "ETH", date: "2023-06-01T00:00:00Z", price: 1800 },
];

function mockFetch(data: unknown, ok = true) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok,
      json: () => Promise.resolve(data),
    })
  );
}

describe("SwitcheoTokenRepository", () => {
  let repo: SwitcheoTokenRepository;

  beforeEach(() => {
    repo = new SwitcheoTokenRepository();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches and returns a list of tokens", async () => {
    mockFetch(mockPrices);
    const tokens = await repo.fetchAll();
    expect(tokens.length).toBeGreaterThan(0);
  });

  it("returns tokens sorted alphabetically by symbol", async () => {
    mockFetch(mockPrices);
    const tokens = await repo.fetchAll();
    const symbols = tokens.map((t) => t.symbol);
    expect(symbols).toEqual([...symbols].sort());
  });

  it("deduplicates tokens keeping one entry per symbol", async () => {
    mockFetch(mockPrices);
    const tokens = await repo.fetchAll();
    const ethTokens = tokens.filter((t) => t.symbol === "ETH");
    expect(ethTokens).toHaveLength(1);
  });

  it("maps symbol to token correctly", async () => {
    mockFetch(mockPrices);
    const tokens = await repo.fetchAll();
    const eth = tokens.find((t) => t.symbol === "ETH");
    expect(eth).toMatchObject({ symbol: "ETH", name: "ETH", price: 2000 });
  });

  it("calls the correct API URL", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockPrices),
    });
    vi.stubGlobal("fetch", fetchSpy);

    await repo.fetchAll();

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://interview.switcheo.com/prices.json"
    );
  });

  it("throws when fetch fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, json: () => Promise.resolve([]) })
    );
    await expect(repo.fetchAll()).rejects.toThrow("Failed to load token prices");
  });

  it("throws when network errors out", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network error")));
    await expect(repo.fetchAll()).rejects.toThrow("Network error");
  });
});