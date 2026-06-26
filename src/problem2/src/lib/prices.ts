import type { PriceRecord, Token } from "../types";

const PRICES_URL = "https://interview.switcheo.com/prices.json";
const ICON_BASE =
  "https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens";

/**
 * Fetch the prices feed and return a deduplicated, sorted list of tokens.
 *
 * The feed can contain multiple records for the same currency (one per date).
 * We keep only the most recent price for each symbol and drop anything that
 * doesn't have a valid price, as instructed by the problem.
 */
export async function fetchTokens(): Promise<Token[]> {
  const records: PriceRecord[] = await fetch(PRICES_URL).then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  });

  // Collapse multiple date entries into a single "latest" record per symbol.
  const latest = new Map<string, PriceRecord>();
  for (const record of records) {
    const existing = latest.get(record.currency);
    if (!existing || new Date(record.date) > new Date(existing.date)) {
      latest.set(record.currency, record);
    }
  }

  return Array.from(latest.values())
    .filter((r) => r.price > 0)
    .map((r) => ({
      symbol: r.currency,
      price: r.price,
      iconUrl: `${ICON_BASE}/${r.currency}.svg`,
    }))
    .sort((a, b) => a.symbol.localeCompare(b.symbol));
}
