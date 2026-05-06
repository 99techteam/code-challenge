import { PRICE_URL } from "./constants";

export type PriceRow = {
  currency: string;
  date: string;
  price: number;
};

export function isPriceRow(value: unknown): value is PriceRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<PriceRow>;
  return (
    typeof row.currency === "string" &&
    typeof row.date === "string" &&
    typeof row.price === "number" &&
    !Number.isNaN(row.price)
  );
}

export function getLatestPriceMap(priceRows: PriceRow[]): Map<string, number> {
  const latestByCurrency = new Map<string, { date: string; price: number }>();

  for (const row of priceRows) {
    const existing = latestByCurrency.get(row.currency);
    if (!existing || new Date(row.date) > new Date(existing.date)) {
      latestByCurrency.set(row.currency, { date: row.date, price: row.price });
    }
  }

  const sortedEntries: Array<[string, number]> = [...latestByCurrency.entries()]
    .filter(([, value]) => value.price > 0)
    .map(([symbol, value]) => [symbol, value.price] as [string, number])
    .sort((a, b) => a[0].localeCompare(b[0]));

  return new Map<string, number>(sortedEntries);
}

export async function fetchTokenPrices(): Promise<Map<string, number>> {
  const response = await fetch(PRICE_URL);
  if (!response.ok) {
    throw new Error(`Unable to load prices (${response.status}).`);
  }

  const payload: unknown = await response.json();
  const priceRows = Array.isArray(payload) ? payload.filter(isPriceRow) : [];
  const map = getLatestPriceMap(priceRows);

  if (map.size < 2) {
    throw new Error("Not enough token prices available to perform a swap.");
  }

  return map;
}
