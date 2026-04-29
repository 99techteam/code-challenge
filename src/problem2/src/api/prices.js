const PRICE_URL = "https://interview.switcheo.com/prices.json";
const ICON_URL = "https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/";

const FALLBACK_PRICES = [
  { currency: "ETH", price: 1645.9337373737374 },
  { currency: "WBTC", price: 26002.82202020202 },
  { currency: "ATOM", price: 7.186657333333334 },
  { currency: "OSMO", price: 0.3772974333333333 },
  { currency: "SWTH", price: 0.004039850455012084 },
  { currency: "USDC", price: 1 },
  { currency: "USD", price: 1 }
];

export function normalizePrices(items) {
  // The API can include repeated currencies, so keep only the latest price per token.
  const latestByCurrency = {};

  items.forEach((item) => {
    if (!item.currency || typeof item.price !== "number") {
      return;
    }

    const existing = latestByCurrency[item.currency];
    const itemTime = item.date ? new Date(item.date).getTime() : 0;
    const existingTime = existing?.date ? new Date(existing.date).getTime() : -1;

    if (!existing || itemTime >= existingTime) {
      latestByCurrency[item.currency] = item;
    }
  });

  return Object.keys(latestByCurrency)
    .sort()
    .map((currency) => ({
      symbol: currency,
      price: latestByCurrency[currency].price,
      icon: `${ICON_URL}${currency}.svg`
    }));
}

export async function fetchTokenPrices() {
  try {
    const response = await fetch(PRICE_URL);

    if (!response.ok) {
      throw new Error("Price request failed");
    }

    return {
      source: "live",
      tokens: normalizePrices(await response.json())
    };
  } catch {
    // Keep the form usable during network issues or local review without internet access.
    return {
      source: "demo",
      tokens: normalizePrices(FALLBACK_PRICES)
    };
  }
}
