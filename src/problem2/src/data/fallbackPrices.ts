import type { TokenPrice } from "../types";
import raw from "../prices.json";

// Bundled snapshot of https://interview.switcheo.com/prices.json,
// already deduplicated to the latest entry per currency.
// Used only if the live fetch at runtime fails (offline demo, CORS, etc).
export const fallbackPrices = raw as TokenPrice[];
