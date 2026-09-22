import { QueryClient } from '@tanstack/react-query';

/**
 * The app's cache and the defaults every query inherits.
 *
 * Built by a factory rather than exported as a module singleton so each mount —
 * the app in the browser, every test that renders it — gets its own cache and
 * cannot inherit another one's data.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // The feed is a snapshot that moves slowly, so a minute-old quote is
        // still worth showing while a background refetch goes out. An explicit
        // refresh calls `refetch`, which ignores this and always hits the feed.
        staleTime: 60_000,
        // One quick retry absorbs a dropped connection without the user seeing
        // it. The default backoff starts at a second, which is long enough to
        // read as a hang; a real outage should surface fast and offer Retry.
        retry: 1,
        retryDelay: 300,
      },
    },
  });
}
