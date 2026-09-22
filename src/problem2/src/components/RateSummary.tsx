import { useRelativeTime } from '@/hooks/useRelativeTime';
import { formatAmount } from '@/lib/format';
import type { Token } from '@/types';

interface RateSummaryProps {
  from: Token | null;
  to: Token | null;
  /** How many `to` one `from` buys, or `null` before prices load. */
  rate: number | null;
  /** Epoch ms of the last successful fetch, or `null` before the first one. */
  updatedAt: number | null;
  /** True while a request is in flight. */
  refreshing: boolean;
}

interface SummaryRowProps {
  label: string;
  value: string;
}

function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="shrink-0 text-sm whitespace-nowrap text-muted-foreground">{label}</dt>
      <dd className="text-right font-mono text-sm tabular-nums">{value}</dd>
    </div>
  );
}

/**
 * The rate behind the conversion, and when the app last asked the feed for it.
 *
 * The feed is a fixed snapshot, so nothing else on the card moves when it is
 * re-fetched — without the second row the refresh control would look inert.
 */
export function RateSummary({ from, to, rate, updatedAt, refreshing }: RateSummaryProps) {
  const updatedAgo = useRelativeTime(updatedAt);

  const rateLine =
    from && to && rate !== null
      ? `1 ${from.code} = ${formatAmount(rate, Math.max(2, to.decimals))} ${to.code}`
      : '—';

  return (
    <dl className="flex flex-col gap-2 px-1 pt-3.5 pb-0.5">
      <SummaryRow label="Mid-market rate" value={rateLine} />
      <SummaryRow label="Updated" value={refreshing ? 'Updating…' : (updatedAgo ?? '—')} />
    </dl>
  );
}
