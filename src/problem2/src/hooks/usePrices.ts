import { queryOptions, useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import { fetchTokens } from '@/lib/prices';
import type { PricesStatus, Token } from '@/types';

/** One stable empty list, so `tokens` keeps its identity before data arrives. */
const NO_TOKENS: Token[] = [];

/**
 * The price feed as a query: the key and the fetcher in one place, so a second
 * consumer or a prefetch would share this definition rather than restate it.
 */
const pricesQuery = queryOptions({
  queryKey: ['prices'],
  queryFn: async ({ signal }) => {
    const tokens = await fetchTokens(signal);

    // A feed with nothing quotable in it is a failed load, not an empty result:
    // throwing sends it down the same path as an unreachable feed, which retries
    // once and leaves the last good prices on screen.
    if (tokens.length === 0) {
      throw new Error('The price feed returned no usable prices.');
    }

    return tokens;
  },
});

interface PricesResult {
  tokens: Token[];
  status: PricesStatus;
  /** Why the last attempt failed, or `null`. Set even when usable prices remain. */
  error: string | null;
  /** True while a request is in flight, including the first load. */
  refreshing: boolean;
  /** Epoch ms of the last successful fetch — when the app last spoke to the feed. */
  updatedAt: number | null;
  refresh: () => void;
}

/**
 * Loads the price feed and re-reads it on demand.
 *
 * The query keeps the previous list on screen through a refresh rather than
 * dropping back to the loading state, and holds on to it when a refresh fails:
 * a converter that still quotes slightly stale rates is more useful than one
 * that blanks out. `status` therefore only reports `error` when there is nothing
 * left to quote from; `error` is set either way.
 *
 * The React Query cache also means cancellation, de-duplication and the retry
 * are not this hook's problem: it maps one query onto the vocabulary the card
 * renders from.
 */
export function usePrices(): PricesResult {
  const query = useQuery(pricesQuery);
  const { refetch } = query;

  const refresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const tokens = query.data ?? NO_TOKENS;
  const status: PricesStatus = tokens.length > 0 ? 'ready' : query.isPending ? 'loading' : 'error';

  return {
    tokens,
    status,
    // `fetch` and the feed both fail with an `Error`, so its message is the one
    // worth showing — it names the status code or the network fault.
    error: query.error?.message ?? null,
    refreshing: query.isFetching,
    // The query reports 0 until the first success; the card wants nothing there.
    updatedAt: query.dataUpdatedAt === 0 ? null : query.dataUpdatedAt,
    refresh,
  };
}
