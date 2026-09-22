import { AxiosError, isAxiosError } from 'axios';

import { decimalsForPrice } from '@/lib/format';
import { http } from '@/lib/http';
import { priceFeedSchema, priceRecordSchema, type PriceRecord } from '@/lib/schema';
import { tokenIconUrl, tokenName } from '@/lib/tokens';
import type { Token } from '@/types';

export const PRICES_URL = 'https://interview.switcheo.com/prices.json';

/**
 * Turn the raw feed into the token list the converter quotes from.
 *
 * Two things the feed does that the UI must not inherit: it repeats currencies
 * (four `USDC` rows, two `BUSD`) and it has historically shipped rows with no
 * usable price. Rows are validated one at a time so a single bad row costs one
 * asset rather than the whole load, and duplicates collapse to the newest quote.
 */
export function toTokens(feed: unknown): Token[] {
  const rows = priceFeedSchema.safeParse(feed);
  if (!rows.success) return [];

  const newest = new Map<string, PriceRecord>();

  for (const row of rows.data) {
    const record = priceRecordSchema.safeParse(row);
    if (!record.success) continue;

    const current = newest.get(record.data.currency);
    if (!current || record.data.date >= current.date) {
      newest.set(record.data.currency, record.data);
    }
  }

  return [...newest.values()]
    .map((record) => ({
      code: record.currency,
      name: tokenName(record.currency),
      price: record.price,
      decimals: decimalsForPrice(record.price),
      iconUrl: tokenIconUrl(record.currency),
    }))
    .sort((a, b) => a.code.localeCompare(b.code, 'en'));
}

/**
 * Say what went wrong in the app's own words.
 *
 * axios rejects on a non-2xx rather than handing back a response to inspect, so
 * this is where a transport failure becomes something the card can show.
 */
function feedFailure(cause: unknown): string {
  if (isAxiosError(cause)) {
    if (cause.response) return `Price feed responded ${String(cause.response.status)}`;
    if (cause.code === AxiosError.ECONNABORTED || cause.code === AxiosError.ETIMEDOUT) {
      return 'The price feed timed out.';
    }

    return 'The price feed could not be reached.';
  }

  return cause instanceof Error ? cause.message : 'Could not load prices.';
}

/** Fetch and normalise the price feed. Throws if the request fails. */
export async function fetchTokens(signal?: AbortSignal): Promise<Token[]> {
  try {
    const { data } = await http.get<unknown>(PRICES_URL, {
      signal,
      // The cache-buster stands in for `fetch`'s `cache: 'no-store'`, which
      // axios has no equivalent of. It is also the only option here: the feed
      // sends no `Cache-Control` and a `Last-Modified` from 2023, so a browser
      // may heuristically serve it from cache for months and the refresh
      // control would do nothing — and the request header that says the same
      // thing is not CORS-safelisted, so it would trigger a preflight this
      // endpoint answers with a 403.
      params: { t: Date.now() },
    });

    return toTokens(data);
  } catch (cause) {
    throw new Error(feedFailure(cause), { cause });
  }
}

/**
 * How many `to` one `from` buys. Both prices are quoted in USD, so the USD
 * cancels out and no reference currency has to be threaded through the UI.
 */
export function exchangeRate(from: Token, to: Token): number {
  return from.price / to.price;
}
