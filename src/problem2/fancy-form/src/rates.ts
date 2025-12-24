export enum Rate {
  BLUR = "BLUR",
  bNEO = "bNEO",
  BUSD = "BUSD",
  USD = "USD",
  ETH = "ETH",
  GMX = "GMX",
  STEVMOS = "STEVMOS",
  LUNA = "LUNA",
  RATOM = "RATOM",
  STRD = "STRD",
  EVMOS = "EVMOS",
  IBCX = "IBCX",
  IRIS = "IRIS",
  ampLUNA = "ampLUNA",
  KUJI = "KUJI",
  STOSMO = "STOSMO",
  USDC = "USDC",
  axlUSDC = "axlUSDC",
  ATOM = "ATOM",
  STATOM = "STATOM",
  OSMO = "OSMO",
  rSWTH = "rSWTH",
  STLUNA = "STLUNA",
  LSI = "LSI",
  OKB = "OKB",
  OKT = "OKT",
  SWTH = "SWTH",
  USC = "USC",
  WBTC = "WBTC",
  wstETH = "wstETH",
  YieldUSD = "YieldUSD",
  ZIL = "ZIL",
}

export type RateEntry = {
  currency: Rate;
  date: string;
  price: number;
};

export const RATES: RateEntry[] = [
  { currency: Rate.BLUR, date: "2023-08-29T07:10:40.000Z", price: 0.20811525423728813 },
  { currency: Rate.bNEO, date: "2023-08-29T07:10:50.000Z", price: 7.1282679 },
  { currency: Rate.BUSD, date: "2023-08-29T07:10:40.000Z", price: 0.999183113 },
  { currency: Rate.BUSD, date: "2023-08-29T07:10:40.000Z", price: 0.9998782611186441 },
  { currency: Rate.USD, date: "2023-08-29T07:10:30.000Z", price: 1 },
  { currency: Rate.ETH, date: "2023-08-29T07:10:52.000Z", price: 1645.9337373737374 },
  { currency: Rate.GMX, date: "2023-08-29T07:10:40.000Z", price: 36.345114372881355 },
  { currency: Rate.STEVMOS, date: "2023-08-29T07:10:40.000Z", price: 0.07276706779661017 },
  { currency: Rate.LUNA, date: "2023-08-29T07:10:40.000Z", price: 0.40955638983050846 },
  { currency: Rate.RATOM, date: "2023-08-29T07:10:40.000Z", price: 10.250918915254237 },
  { currency: Rate.STRD, date: "2023-08-29T07:10:40.000Z", price: 0.7386553389830508 },
  { currency: Rate.EVMOS, date: "2023-08-29T07:10:40.000Z", price: 0.06246181355932203 },
  { currency: Rate.IBCX, date: "2023-08-29T07:10:40.000Z", price: 41.26811355932203 },
  { currency: Rate.IRIS, date: "2023-08-29T07:10:40.000Z", price: 0.0177095593220339 },
  { currency: Rate.ampLUNA, date: "2023-08-29T07:10:40.000Z", price: 0.49548589830508477 },
  { currency: Rate.KUJI, date: "2023-08-29T07:10:45.000Z", price: 0.675 },
  { currency: Rate.STOSMO, date: "2023-08-29T07:10:45.000Z", price: 0.431318 },
  { currency: Rate.USDC, date: "2023-08-29T07:10:40.000Z", price: 0.989832 },
  { currency: Rate.axlUSDC, date: "2023-08-29T07:10:40.000Z", price: 0.989832 },
  { currency: Rate.ATOM, date: "2023-08-29T07:10:50.000Z", price: 7.186657333333334 },
  { currency: Rate.STATOM, date: "2023-08-29T07:10:45.000Z", price: 8.512162050847458 },
  { currency: Rate.OSMO, date: "2023-08-29T07:10:50.000Z", price: 0.3772974333333333 },
  { currency: Rate.rSWTH, date: "2023-08-29T07:10:40.000Z", price: 0.00408771 },
  { currency: Rate.STLUNA, date: "2023-08-29T07:10:40.000Z", price: 0.44232210169491526 },
  { currency: Rate.LSI, date: "2023-08-29T07:10:50.000Z", price: 67.69661525423729 },
  { currency: Rate.OKB, date: "2023-08-29T07:10:40.000Z", price: 42.97562059322034 },
  { currency: Rate.OKT, date: "2023-08-29T07:10:40.000Z", price: 13.561577966101694 },
  { currency: Rate.SWTH, date: "2023-08-29T07:10:45.000Z", price: 0.004039850455012084 },
  { currency: Rate.USC, date: "2023-08-29T07:10:40.000Z", price: 0.994 },
  { currency: Rate.USDC, date: "2023-08-29T07:10:30.000Z", price: 1 },
  { currency: Rate.USDC, date: "2023-08-29T07:10:30.000Z", price: 1 },
  { currency: Rate.USDC, date: "2023-08-29T07:10:40.000Z", price: 0.9998782611186441 },
  { currency: Rate.WBTC, date: "2023-08-29T07:10:52.000Z", price: 26002.82202020202 },
  { currency: Rate.wstETH, date: "2023-08-29T07:10:40.000Z", price: 1872.2579742372882 },
  { currency: Rate.YieldUSD, date: "2023-08-29T07:10:40.000Z", price: 1.0290847966101695 },
  { currency: Rate.ZIL, date: "2023-08-29T07:10:50.000Z", price: 0.01651813559322034 },
];

// Token icon mapping — attempts a few case variants to find a matching icon filename
import ICONS from "./assets/token-icons/index";

function findIconForKey(key: string): string | null {
  if (!ICONS) return null;
  if (ICONS[key]) return ICONS[key];
  const upper = key.toUpperCase();
  if (ICONS[upper]) return ICONS[upper];
  const lower = key.toLowerCase();
  if (ICONS[lower]) return ICONS[lower];
  // try capitalizing first character (e.g. bNEO -> BNEO or ampLUNA -> AmpLUNA)
  const cap = key.charAt(0).toUpperCase() + key.slice(1);
  if (ICONS[cap]) return ICONS[cap];
  // try removing non-alphanumeric
  const stripped = key.replace(/[^a-zA-Z0-9]/g, "");
  if (ICONS[stripped]) return ICONS[stripped];
  if (ICONS[stripped.toUpperCase()]) return ICONS[stripped.toUpperCase()];
  return null;
}

export const RATE_ICONS: Record<Rate, string | null> = Object.values(Rate).reduce((acc, cur) => {
  acc[cur as Rate] = findIconForKey(cur as string);
  return acc;
}, {} as Record<Rate, string | null>);

export function getIconFor(currency: Rate): string | null {
  return RATE_ICONS[currency] ?? null;
}
