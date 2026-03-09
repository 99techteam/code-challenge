import type { PriceRecord, Token } from "../types";
import { getTokenImageUrl } from "../utils/tokenIcon";

const PRICES_URL = "https://interview.switcheo.com/prices.json";

export async function fetchTokensWithPrices(): Promise<Token[]> {
  const res = await fetch(PRICES_URL);
  if (!res.ok) {
    throw new Error("Failed to load token prices. Please try again.");
  }
  const data: PriceRecord[] = await res.json();

  const byCurrency = new Map<string, PriceRecord>();
  for (const row of data) {
    if (row.price == null || row.price <= 0) continue;
    const existing = byCurrency.get(row.currency);
    if (
      !existing ||
      new Date(row.date).getTime() > new Date(existing.date).getTime()
    ) {
      byCurrency.set(row.currency, row);
    }
  }

  return Array.from(byCurrency.values()).map((row) => ({
    currency: row.currency,
    price: row.price,
    imageUrl: getTokenImageUrl(row.currency),
  }));
}
