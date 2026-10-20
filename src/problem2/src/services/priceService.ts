import { DEFAULT_TOKEN_PRICES } from '../data/defaultPrices';
import { Token, SwapQuote } from '../types/swap';

const PRICES_API_URL = 'https://interview.switcheo.com/prices.json';
const TOKEN_ICONS_BASE_URL = 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens';

const TOKEN_NAMES: Record<string, string> = {
  ETH: 'Ethereum',
  USDC: 'USD Coin',
  WBTC: 'Wrapped Bitcoin',
  BUSD: 'Binance USD',
  USD: 'US Dollar',
  SWTH: 'Switcheo Token',
  ATOM: 'Cosmos Hub',
  OSMO: 'Osmosis',
  LUNA: 'Terra',
  BLUR: 'Blur',
  bNEO: 'Burger NEO',
  GMX: 'GMX',
  STEVMOS: 'Staked EVMOS',
  RATOM: 'Reward ATOM',
  STRD: 'Stride',
  EVMOS: 'Evmos',
  IBCX: 'IBC Index',
  IRIS: 'IRISnet',
  ampLUNA: 'Amplify LUNA',
  KUJI: 'Kujira',
  STOSMO: 'Staked OSMO',
  axlUSDC: 'Axelar USDC',
  STATOM: 'Staked ATOM',
  rSWTH: 'Reward SWTH',
  STLUNA: 'Staked LUNA',
  LSI: 'Liquid Staking Index',
  OKB: 'OKB',
  OKT: 'OKT Chain',
  USC: 'USC Stablecoin',
  wstETH: 'Wrapped stETH',
  YieldUSD: 'Yield USD',
  ZIL: 'Zilliqa'
};

interface RawPriceItem {
  currency: string;
  date: string;
  price: number;
}

export function buildToken(symbol: string, price: number, name?: string): Token {
  return {
    symbol,
    name: name || TOKEN_NAMES[symbol] || symbol,
    price,
    decimals: ['USDC', 'USD', 'BUSD', 'axlUSDC', 'USC', 'YieldUSD'].includes(symbol) ? 6 : 18,
    iconUrl: `${TOKEN_ICONS_BASE_URL}/${encodeURIComponent(symbol)}.svg`
  };
}

export async function fetchTokens(): Promise<{ tokens: Token[]; lastUpdated: Date; isLive: boolean }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(PRICES_API_URL, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch prices: ${response.statusText}`);
    }

    const data: RawPriceItem[] = await response.json();

    // Sort by date descending so the newest price comes first
    data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const tokenMap = new Map<string, RawPriceItem>();
    for (const item of data) {
      if (item && item.currency && typeof item.price === 'number' && item.price > 0) {
        if (!tokenMap.has(item.currency)) {
          tokenMap.set(item.currency, item);
        }
      }
    }

    const tokens = Array.from(tokenMap.values()).map(item =>
      buildToken(item.currency, item.price)
    );

    return {
      tokens,
      lastUpdated: new Date(),
      isLive: true
    };
  } catch (err) {
    console.warn('Using fallback prices due to network / CORS error:', err);
    // Graceful fallback to embedded snapshot
    const tokens = DEFAULT_TOKEN_PRICES.map(item =>
      buildToken(item.symbol, item.price, item.name)
    );
    return {
      tokens,
      lastUpdated: new Date(),
      isLive: false
    };
  }
}

export function calculateSwapQuote(
  fromToken: Token,
  toToken: Token,
  fromAmountNum: number,
  slippagePercent: number
): SwapQuote {
  if (!fromToken || !toToken || fromAmountNum <= 0 || fromToken.price <= 0 || toToken.price <= 0) {
    return {
      fromAmount: fromAmountNum || 0,
      toAmount: 0,
      rate: 0,
      inverseRate: 0,
      fromUsd: 0,
      toUsd: 0,
      priceImpact: 0,
      minimumReceived: 0,
      estimatedFeeUsd: 1.25
    };
  }

  const rate = fromToken.price / toToken.price;
  const inverseRate = toToken.price / fromToken.price;
  const rawToAmount = fromAmountNum * rate;

  const fromUsd = fromAmountNum * fromToken.price;
  const toUsd = rawToAmount * toToken.price;

  // Realistic price impact simulation based on trade size
  // e.g. <$1,000 is ~0.02%, $10,000 is ~0.15%, etc.
  const priceImpact = Math.min(Math.max((fromUsd / 50000) * 0.1, 0.02), 5.0);

  // Minimum received accounting for slippage tolerance
  const minimumReceived = rawToAmount * (1 - slippagePercent / 100);

  // Network fee estimation (~$1 - $3 depending on network)
  const estimatedFeeUsd = 1.35;

  return {
    fromAmount: fromAmountNum,
    toAmount: rawToAmount,
    rate,
    inverseRate,
    fromUsd,
    toUsd,
    priceImpact,
    minimumReceived,
    estimatedFeeUsd
  };
}

export function formatNumber(val: number, maxDecimals = 6): string {
  if (isNaN(val) || val === 0) return '0';
  if (val < 0.000001) return '< 0.000001';

  // For small numbers, show up to maxDecimals
  if (val < 1) {
    return Number(val.toFixed(maxDecimals)).toString();
  }

  // For standard numbers
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: maxDecimals,
    minimumFractionDigits: 0
  }).format(val);
}

export function formatUsd(val: number): string {
  if (isNaN(val) || val === 0) return '$0.00';
  if (val < 0.01) return '< $0.01';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(val);
}

