export type PriceMap = Record<string, number>;

export async function fetchPrices(): Promise<PriceMap> {
  const res = await fetch('https://interview.switcheo.com/prices.json');
  if (!res.ok) throw new Error('Failed to fetch prices');
  return res.json();
}
