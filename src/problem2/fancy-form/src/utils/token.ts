import type { Token, TokenPrice } from '@/types';

// Map of token icon modules — these are imported as URLs by Vite
const tokenIconModules = import.meta.glob<string>('@/assets/token-icon/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
});

/**
 * Build a lookup map from currency name to its icon URL.
 */
function buildIconMap(): Map<string, string> {
  const map = new Map<string, string>();

  for (const [path, url] of Object.entries(tokenIconModules)) {
    // Extract filename without extension, e.g., "/src/assets/token-icon/ETH.svg" -> "ETH"
    const filename = path.split('/').pop()?.replace('.svg', '');
    if (filename) {
      map.set(filename, url);
    }
  }

  return map;
}

const iconMap = buildIconMap();

/** Fallback icon URL for tokens without a matching SVG */
const FALLBACK_ICON = '';

/**
 * Resolve the icon URL for a given token currency.
 */
export function getTokenIconUrl(currency: string): string {
  return iconMap.get(currency) ?? FALLBACK_ICON;
}

/**
 * Check if a token has a local icon file.
 */
export function hasTokenIcon(currency: string): boolean {
  return iconMap.has(currency);
}

/**
 * Deduplicate token prices: keep the most recent entry per currency.
 * Filter out tokens with invalid prices.
 */
export function deduplicateTokenPrices(prices: TokenPrice[]): TokenPrice[] {
  const latestByToken = new Map<string, TokenPrice>();

  for (const entry of prices) {
    if (!entry.price || entry.price <= 0) continue;

    const existing = latestByToken.get(entry.currency);
    if (!existing || new Date(entry.date) > new Date(existing.date)) {
      latestByToken.set(entry.currency, entry);
    }
  }

  return Array.from(latestByToken.values());
}

/**
 * Convert raw token prices to processed Token objects sorted alphabetically.
 */
export function processTokenPrices(rawPrices: TokenPrice[]): Token[] {
  const deduplicated = deduplicateTokenPrices(rawPrices);

  return deduplicated
    .map((tp) => ({
      currency: tp.currency,
      price: tp.price,
      iconUrl: getTokenIconUrl(tp.currency),
      hasIcon: hasTokenIcon(tp.currency),
    }))
    .sort((a, b) => a.currency.localeCompare(b.currency));
}
