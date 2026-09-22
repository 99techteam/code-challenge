import type { Token } from '@/types';

const ICON_BASE = 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens';

/**
 * Tickers the price feed spells differently from the icon repository. The repo
 * filenames are case-sensitive, so `STATOM` has to be asked for as `stATOM`.
 */
const ICON_SLUGS: Record<string, string> = {
  RATOM: 'rATOM',
  STATOM: 'stATOM',
  STEVMOS: 'stEVMOS',
  STLUNA: 'stLUNA',
  STOSMO: 'stOSMO',
};

/**
 * Display names for the asset menu. The price feed carries tickers only, so the
 * long names live here; anything missing falls back to its ticker.
 */
const TOKEN_NAMES: Record<string, string> = {
  ampLUNA: 'ERIS Amplified LUNA',
  ATOM: 'Cosmos Hub',
  axlUSDC: 'Axelar USD Coin',
  BLUR: 'Blur',
  bNEO: 'BurgerNEO',
  BUSD: 'Binance USD',
  ETH: 'Ethereum',
  EVMOS: 'Evmos',
  GMX: 'GMX',
  IBCX: 'IBC Index',
  IRIS: 'IRISnet',
  KUJI: 'Kujira',
  LSI: 'Liquid Staking Index',
  LUNA: 'Terra',
  OKB: 'OKB',
  OKT: 'OKT Chain',
  OSMO: 'Osmosis',
  RATOM: 'Staked ATOM (pSTAKE)',
  rSWTH: 'Staked SWTH',
  STATOM: 'Stride Staked ATOM',
  STEVMOS: 'Stride Staked EVMOS',
  STLUNA: 'Stride Staked LUNA',
  STOSMO: 'Stride Staked OSMO',
  STRD: 'Stride',
  SWTH: 'Switcheo',
  USC: 'Carbon USD',
  USD: 'US Dollar',
  USDC: 'USD Coin',
  WBTC: 'Wrapped Bitcoin',
  wstETH: 'Wrapped Staked Ether',
  YieldUSD: 'Yield USD',
  ZIL: 'Zilliqa',
};

/** Where the Switcheo token-icons repository keeps `code`'s artwork. */
export function tokenIconUrl(code: string): string {
  return `${ICON_BASE}/${ICON_SLUGS[code] ?? code}.svg`;
}

/** Long name for `code`, or the ticker itself when we have no better name. */
export function tokenName(code: string): string {
  return TOKEN_NAMES[code] ?? code;
}

/**
 * Two-character stand-in drawn when the remote icon does not load, matching the
 * monogram chips the design falls back to for assets without a glyph.
 */
export function tokenMonogram(code: string): string {
  return code
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 2)
    .toUpperCase();
}

/**
 * The assets matching `query`, in feed order.
 *
 * Tickers are short and cased inconsistently (`stATOM`, `bNEO`), so this is a
 * plain case-insensitive substring match over ticker and name rather than fuzzy
 * scoring: "usd" should find USDC, BUSD and Carbon USD alike, and "eth" should
 * not rank ETH below something that merely shares its letters.
 */
export function searchTokens(tokens: Token[], query: string): Token[] {
  const term = query.trim().toLowerCase();
  if (!term) return tokens;

  return tokens.filter(
    ({ code, name }) => code.toLowerCase().includes(term) || name.toLowerCase().includes(term),
  );
}
