// Token price data - synchronized with frontend
export const PRICE_DATA = [
  { currency: "BLUR", price: 0.20811525423728813 },
  { currency: "bNEO", price: 7.1282679 },
  { currency: "BUSD", price: 0.999183113 },
  { currency: "USD", price: 1 },
  { currency: "ETH", price: 1645.9337373737374 },
  { currency: "GMX", price: 36.345114372881355 },
  { currency: "STEVMOS", price: 0.07276706779661017 },
  { currency: "LUNA", price: 0.40955638983050846 },
  { currency: "RATOM", price: 10.250918915254237 },
  { currency: "STRD", price: 0.7386553389830508 },
  { currency: "EVMOS", price: 0.06246181355932203 },
  { currency: "IBCX", price: 41.26811355932203 },
  { currency: "IRIS", price: 0.0177095593220339 },
  { currency: "ampLUNA", price: 0.49548589830508477 },
  { currency: "KUJI", price: 0.675 },
  { currency: "STOSMO", price: 0.431318 },
  { currency: "USDC", price: 0.989832 },
  { currency: "axlUSDC", price: 0.989832 },
  { currency: "ATOM", price: 7.186657333333334 },
  { currency: "STATOM", price: 8.512162050847458 },
  { currency: "OSMO", price: 0.3772974333333333 },
  { currency: "rSWTH", price: 0.00408771 },
  { currency: "STLUNA", price: 0.44232210169491526 },
  { currency: "LSI", price: 67.69661525423729 },
  { currency: "OKB", price: 42.97562059322034 },
  { currency: "OKT", price: 13.561577966101694 },
  { currency: "SWTH", price: 0.004039850455012084 },
  { currency: "USC", price: 0.994 },
  { currency: "WBTC", price: 26002.82202020202 },
  { currency: "wstETH", price: 1872.2579742372882 },
  { currency: "YieldUSD", price: 1.0290847966101695 },
  { currency: "ZIL", price: 0.01651813559322034 },
];

// Export all valid currency symbols
export const VALID_CURRENCIES = PRICE_DATA.map((item) => item.currency);

// Export exchange rates as a record
export const EXCHANGE_RATES: Record<string, number> = PRICE_DATA.reduce(
  (acc, item) => {
    acc[item.currency] = item.price;
    return acc;
  },
  {} as Record<string, number>
);

// Helper to validate if a currency is supported
export const isValidCurrency = (currency: string): boolean => {
  return VALID_CURRENCIES.includes(currency);
};

// Helper to get price for a currency
export const getPrice = (currency: string): number | null => {
  return EXCHANGE_RATES[currency] || null;
};
