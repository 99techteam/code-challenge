import type { PriceMap, TokenPrice } from "../types";
import { fallbackPrices } from "../data/fallbackPrices";

const PRICES_URL = "https://interview.switcheo.com/prices.json";

// The feed contains duplicate/stale rows per currency (and a few zero/undefined
// prices). Keep only the most recent, positive-price entry for each currency.
function toLatestPriceMap(entries: TokenPrice[]): PriceMap {
  const latest: PriceMap = {};
  for (const entry of entries) {
    if (!entry.price || entry.price <= 0) continue;
    const existing = latest[entry.currency];
    if (!existing || new Date(entry.date) > new Date(existing.date)) {
      latest[entry.currency] = entry;
    }
  }
  return latest;
}

export async function loadPrices(): Promise<PriceMap> {
  try {
    const res = await fetch(PRICES_URL);
    if (!res.ok) throw new Error(`Price feed responded with ${res.status}`);
    const data: TokenPrice[] = await res.json();
    return toLatestPriceMap(data);
  } catch (err) {
    console.warn("Falling back to bundled price snapshot:", err);
    return toLatestPriceMap(fallbackPrices);
  }
}
