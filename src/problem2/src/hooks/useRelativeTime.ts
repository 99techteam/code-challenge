import { useEffect, useState } from 'react';

import { formatRelativeTime } from '@/lib/format';

/** How often the label is recomputed. Ten seconds keeps "just now" honest. */
const TICK_MS = 10_000;

/**
 * A "3m ago" label that keeps counting while the page sits open.
 *
 * The value is derived from `timestamp` on every render; the interval exists
 * only to force those renders, so no copy of the label is held in state.
 */
export function useRelativeTime(timestamp: number | null): string | null {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (timestamp === null) return;

    const timer = setInterval(() => {
      setTick((tick) => tick + 1);
    }, TICK_MS);

    return () => {
      clearInterval(timer);
    };
  }, [timestamp]);

  return timestamp === null ? null : formatRelativeTime(timestamp);
}
