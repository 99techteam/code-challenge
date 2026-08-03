export const PRICE_ENDPOINT = "https://interview.switcheo.com/prices.json";
export const ICON_BASE_URL =
  "https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens";

export interface RawPrice {
  currency?: unknown;
  date?: unknown;
  price?: unknown;
}

export interface Token {
  symbol: string;
  name: string;
  price: number;
  date: string | null;
  iconUrl: string;
  balance: number;
}

export interface TokenLoadResult {
  tokens: Token[];
  source: "live" | "fallback";
  loadedAt: Date;
  warning?: string;
}

export interface SwapQuote {
  rate: number;
  grossOutput: number;
  serviceFee: number;
  netOutput: number;
  minimumReceived: number;
  usdValue: number;
  priceImpactPercent: number;
}

export type SwapIntent = "maximize" | "balanced" | "protect";
export type RouteId = "direct" | "split" | "stable";

export interface RouteAllocation {
  venue: string;
  percentage: number;
}

export interface RouteQuote extends SwapQuote {
  id: RouteId;
  label: string;
  shortLabel: string;
  description: string;
  latencySeconds: number;
  confidencePercent: number;
  riskLabel: "Low" | "Moderate" | "Elevated";
  allocation: RouteAllocation[];
  intentScores: Record<SwapIntent, number>;
}

const TOKEN_NAMES: Record<string, string> = {
  "1INCH": "1inch",
  AAVE: "Aave",
  ADA: "Cardano",
  AKT: "Akash Network",
  ALGO: "Algorand",
  APT: "Aptos",
  ARB: "Arbitrum",
  ATOM: "Cosmos",
  AVAX: "Avalanche",
  BNB: "BNB",
  BTC: "Bitcoin",
  WBTC: "Wrapped Bitcoin",
  BUSD: "Binance USD",
  CRO: "Cronos",
  DAI: "Dai",
  DOT: "Polkadot",
  ETH: "Ethereum",
  EVMOS: "Evmos",
  FTM: "Fantom",
  GMX: "GMX",
  INJ: "Injective",
  IRIS: "IRISnet",
  KUJI: "Kujira",
  LINK: "Chainlink",
  LSI: "Liquid Staking Index",
  LUNA: "Terra",
  MATIC: "Polygon",
  NEAR: "NEAR Protocol",
  OKB: "OKB",
  OKT: "OKT Chain",
  OSMO: "Osmosis",
  RATOM: "Stride stATOM",
  SOL: "Solana",
  STATOM: "Stride stATOM",
  STEVMOS: "Stride stEVMOS",
  STLUNA: "Stride stLUNA",
  STOSMO: "Stride stOSMO",
  STRD: "Stride",
  SWTH: "Carbon",
  UNI: "Uniswap",
  USC: "Carbon USD",
  USD: "US Dollar",
  USDC: "USD Coin",
  USDT: "Tether",
  WSTETH: "Wrapped stETH",
  YIELDUSD: "Yield USD",
};

const POPULAR_ORDER = [
  "ETH",
  "BTC",
  "WBTC",
  "USDC",
  "USDT",
  "ATOM",
  "OSMO",
  "SWTH",
  "LUNA",
  "BNB",
];

export const FALLBACK_PRICES: RawPrice[] = [
  { currency: "ETH", date: "2026-08-03T00:00:00Z", price: 3550.42 },
  { currency: "BTC", date: "2026-08-03T00:00:00Z", price: 118420.12 },
  { currency: "WBTC", date: "2026-08-03T00:00:00Z", price: 118180.45 },
  { currency: "USDC", date: "2026-08-03T00:00:00Z", price: 1.0 },
  { currency: "USDT", date: "2026-08-03T00:00:00Z", price: 0.9998 },
  { currency: "ATOM", date: "2026-08-03T00:00:00Z", price: 5.18 },
  { currency: "OSMO", date: "2026-08-03T00:00:00Z", price: 0.238 },
  { currency: "SWTH", date: "2026-08-03T00:00:00Z", price: 0.0042 },
  { currency: "LUNA", date: "2026-08-03T00:00:00Z", price: 0.165 },
  { currency: "STRD", date: "2026-08-03T00:00:00Z", price: 0.42 },
  { currency: "EVMOS", date: "2026-08-03T00:00:00Z", price: 0.011 },
  { currency: "STEVMOS", date: "2026-08-03T00:00:00Z", price: 0.014 },
  { currency: "STATOM", date: "2026-08-03T00:00:00Z", price: 6.23 },
  { currency: "STOSMO", date: "2026-08-03T00:00:00Z", price: 0.284 },
  { currency: "KUJI", date: "2026-08-03T00:00:00Z", price: 0.19 },
  { currency: "IRIS", date: "2026-08-03T00:00:00Z", price: 0.012 },
  { currency: "OKB", date: "2026-08-03T00:00:00Z", price: 48.2 },
  { currency: "OKT", date: "2026-08-03T00:00:00Z", price: 7.3 },
  { currency: "BUSD", date: "2026-08-03T00:00:00Z", price: 1.0 },
  { currency: "GMX", date: "2026-08-03T00:00:00Z", price: 17.4 },
];

function tokenName(symbol: string): string {
  return TOKEN_NAMES[symbol.toUpperCase()] ?? symbol;
}

function deterministicBalance(symbol: string, price: number): number {
  const uppercase = symbol.toUpperCase();

  if (["USDC", "USDT", "BUSD", "USD", "USC"].includes(uppercase)) {
    return 12_480.25;
  }

  if (["BTC", "WBTC"].includes(uppercase)) {
    return 0.8426;
  }

  if (uppercase === "ETH") {
    return 7.824;
  }

  let hash = 0;
  for (const character of uppercase) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }

  const targetUsd = 1200 + (hash % 7800);
  return Math.max(0.01, targetUsd / price);
}

function parseDate(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : new Date(timestamp).toISOString();
}

export function normalizePrices(payload: unknown): Token[] {
  if (!Array.isArray(payload)) {
    throw new TypeError("Price payload must be an array");
  }

  const latestByCurrency = new Map<
    string,
    { symbol: string; price: number; date: string | null; timestamp: number }
  >();

  for (const item of payload as RawPrice[]) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const symbol =
      typeof item.currency === "string" ? item.currency.trim() : "";
    const price = Number(item.price);

    if (!symbol || !Number.isFinite(price) || price <= 0) {
      continue;
    }

    const date = parseDate(item.date);
    const timestamp = date ? Date.parse(date) : 0;
    const key = symbol.toUpperCase();
    const current = latestByCurrency.get(key);

    if (!current || timestamp >= current.timestamp) {
      latestByCurrency.set(key, {
        symbol,
        price,
        date,
        timestamp,
      });
    }
  }

  const tokens = [...latestByCurrency.values()].map((entry) => ({
    symbol: entry.symbol,
    name: tokenName(entry.symbol),
    price: entry.price,
    date: entry.date,
    iconUrl: `${ICON_BASE_URL}/${encodeURIComponent(entry.symbol)}.svg`,
    balance: deterministicBalance(entry.symbol, entry.price),
  }));

  return tokens.sort((left, right) => {
    const leftIndex = POPULAR_ORDER.indexOf(left.symbol.toUpperCase());
    const rightIndex = POPULAR_ORDER.indexOf(right.symbol.toUpperCase());

    if (leftIndex !== -1 || rightIndex !== -1) {
      if (leftIndex === -1) return 1;
      if (rightIndex === -1) return -1;
      return leftIndex - rightIndex;
    }

    return left.symbol.localeCompare(right.symbol);
  });
}

export async function loadTokens(signal?: AbortSignal): Promise<TokenLoadResult> {
  try {
    const requestInit: RequestInit = {
      headers: { Accept: "application/json" },
    };

    if (signal) {
      requestInit.signal = signal;
    }

    const response = await fetch(PRICE_ENDPOINT, requestInit);

    if (!response.ok) {
      throw new Error(`Price service returned HTTP ${response.status}`);
    }

    const tokens = normalizePrices(await response.json());

    if (tokens.length < 2) {
      throw new Error("Price service returned fewer than two usable assets");
    }

    return {
      tokens,
      source: "live",
      loadedAt: new Date(),
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    return {
      tokens: normalizePrices(FALLBACK_PRICES),
      source: "fallback",
      loadedAt: new Date(),
      warning:
        "Live prices are temporarily unavailable. Showing resilient demo data.",
    };
  }
}

export function calculateQuote(
  amount: number,
  fromToken: Token,
  toToken: Token,
  slippagePercent: number,
): SwapQuote {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new RangeError("Amount must be greater than zero");
  }

  if (fromToken.symbol.toUpperCase() === toToken.symbol.toUpperCase()) {
    throw new Error("Source and destination tokens must differ");
  }

  const rate = fromToken.price / toToken.price;
  const grossOutput = amount * rate;
  const serviceFee = grossOutput * 0.001;
  const netOutput = grossOutput - serviceFee;
  const minimumReceived = netOutput * (1 - slippagePercent / 100);
  const usdValue = amount * fromToken.price;

  // A small deterministic simulation for presentation only.
  const priceImpactPercent = Math.min(
    0.85,
    Math.max(0.01, (usdValue / 2_000_000) * 0.12),
  );

  return {
    rate,
    grossOutput,
    serviceFee,
    netOutput,
    minimumReceived,
    usdValue,
    priceImpactPercent,
  };
}


const ROUTE_CONFIGS: Array<{
  id: RouteId;
  label: string;
  shortLabel: string;
  description: string;
  rateAdjustment: number;
  feeRate: number;
  impactMultiplier: number;
  latencySeconds: number;
  baseConfidence: number;
  riskLabel: RouteQuote["riskLabel"];
  allocation: RouteAllocation[];
  intentScores: Record<SwapIntent, number>;
}> = [
  {
    id: "direct",
    label: "Direct Market",
    shortLabel: "Direct",
    description: "One venue, minimal hops, and a predictable execution path.",
    rateAdjustment: 0,
    feeRate: 0.001,
    impactMultiplier: 1,
    latencySeconds: 1.1,
    baseConfidence: 94,
    riskLabel: "Moderate",
    allocation: [{ venue: "Primary pool", percentage: 100 }],
    intentScores: { maximize: 91, balanced: 98, protect: 90 },
  },
  {
    id: "split",
    label: "Smart Split",
    shortLabel: "Split",
    description: "Divides the order across three venues to reduce price impact.",
    rateAdjustment: 0.0016,
    feeRate: 0.0012,
    impactMultiplier: 0.56,
    latencySeconds: 1.8,
    baseConfidence: 96,
    riskLabel: "Moderate",
    allocation: [
      { venue: "Primary pool", percentage: 54 },
      { venue: "Stable pool", percentage: 31 },
      { venue: "Reserve route", percentage: 15 },
    ],
    intentScores: { maximize: 100, balanced: 96, protect: 89 },
  },
  {
    id: "stable",
    label: "Stable Shield",
    shortLabel: "Shield",
    description: "Prioritizes low route variance and stronger downside protection.",
    rateAdjustment: -0.0011,
    feeRate: 0.0007,
    impactMultiplier: 0.34,
    latencySeconds: 0.9,
    baseConfidence: 99,
    riskLabel: "Low",
    allocation: [
      { venue: "Stable pool", percentage: 82 },
      { venue: "Reserve route", percentage: 18 },
    ],
    intentScores: { maximize: 85, balanced: 93, protect: 100 },
  },
];

export function buildRouteQuotes(
  amount: number,
  fromToken: Token,
  toToken: Token,
  slippagePercent: number,
): RouteQuote[] {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new RangeError("Amount must be greater than zero");
  }

  if (fromToken.symbol.toUpperCase() === toToken.symbol.toUpperCase()) {
    throw new Error("Source and destination tokens must differ");
  }

  const baseRate = fromToken.price / toToken.price;
  const usdValue = amount * fromToken.price;
  const baseImpact = Math.min(
    0.85,
    Math.max(0.01, (usdValue / 2_000_000) * 0.12),
  );

  return ROUTE_CONFIGS.map((config) => {
    const rate = baseRate * (1 + config.rateAdjustment);
    const grossOutput = amount * rate;
    const serviceFee = grossOutput * config.feeRate;
    const netOutput = grossOutput - serviceFee;
    const priceImpactPercent = baseImpact * config.impactMultiplier;
    const minimumReceived = netOutput * (1 - slippagePercent / 100);
    const confidencePercent = Math.max(
      72,
      Math.min(99, config.baseConfidence - priceImpactPercent * 4),
    );

    return {
      id: config.id,
      label: config.label,
      shortLabel: config.shortLabel,
      description: config.description,
      latencySeconds: config.latencySeconds,
      confidencePercent,
      riskLabel: config.riskLabel,
      allocation: config.allocation,
      intentScores: config.intentScores,
      rate,
      grossOutput,
      serviceFee,
      netOutput,
      minimumReceived,
      usdValue,
      priceImpactPercent,
    };
  });
}

export function chooseRecommendedRoute(
  routes: RouteQuote[],
  intent: SwapIntent,
): RouteQuote {
  const sorted = [...routes].sort(
    (left, right) => right.intentScores[intent] - left.intentScores[intent],
  );

  const selected = sorted[0];
  if (!selected) {
    throw new Error("No route quote is available");
  }

  return selected;
}

export function projectRouteOutput(
  route: RouteQuote,
  destinationPriceMovePercent: number,
): number {
  if (!Number.isFinite(destinationPriceMovePercent)) {
    throw new TypeError("Market movement must be finite");
  }

  const multiplier = 1 + destinationPriceMovePercent / 100;
  if (multiplier <= 0) {
    throw new RangeError("Market movement produces an invalid price");
  }

  return route.netOutput / multiplier;
}

export function validateAmount(
  rawValue: string,
  balance: number,
): string | null {
  const normalized = rawValue.trim();

  if (!normalized) {
    return "Enter an amount to continue.";
  }

  if (!/^(?:\d+\.?\d*|\.\d+)$/.test(normalized)) {
    return "Use numbers and a single decimal point only.";
  }

  const decimalPart = normalized.split(".")[1];
  if (decimalPart && decimalPart.length > 8) {
    return "Use no more than 8 decimal places.";
  }

  const amount = Number(normalized);

  if (!Number.isFinite(amount) || amount <= 0) {
    return "Amount must be greater than zero.";
  }

  if (amount > balance) {
    return `Insufficient demo balance. Available: ${formatTokenAmount(balance)}.`;
  }

  return null;
}

export function formatTokenAmount(value: number, maximumFractionDigits = 6): string {
  if (!Number.isFinite(value)) {
    return "—";
  }

  if (value !== 0 && Math.abs(value) < 0.000001) {
    return value.toExponential(3);
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatUsd(value: number): string {
  if (!Number.isFinite(value)) {
    return "—";
  }

  if (Math.abs(value) < 0.01 && value !== 0) {
    return "< $0.01";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  }).format(value);
}

export function formatPrice(value: number): string {
  if (value >= 1000) {
    return formatUsd(value);
  }

  if (value >= 1) {
    return `$${value.toLocaleString("en-US", {
      maximumFractionDigits: 4,
    })}`;
  }

  return `$${value.toLocaleString("en-US", {
    maximumSignificantDigits: 4,
  })}`;
}

export function chooseDefaultPair(tokens: Token[]): [Token, Token] {
  const find = (symbol: string) =>
    tokens.find((token) => token.symbol.toUpperCase() === symbol);

  const from = find("ETH") ?? find("ATOM") ?? tokens[0];
  const to =
    find("USDC") ??
    find("USDT") ??
    tokens.find((token) => token !== from) ??
    tokens[1];

  if (!from || !to) {
    throw new Error("At least two priced tokens are required");
  }

  return [from, to];
}

export function popularTokens(tokens: Token[]): Token[] {
  const popular = POPULAR_ORDER.map((symbol) =>
    tokens.find((token) => token.symbol.toUpperCase() === symbol),
  ).filter((token): token is Token => Boolean(token));

  return popular.slice(0, 5);
}
