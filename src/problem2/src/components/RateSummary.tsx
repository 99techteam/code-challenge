import type { Token } from "../types";
import { formatDisplayNumber } from "../lib/tokens";

type Props = {
  fromToken: Token | null;
  toToken: Token | null;
};

export function RateSummary({ fromToken, toToken }: Props) {
  if (!fromToken || !toToken || fromToken.symbol === toToken.symbol) {
    return null;
  }
  const rate = fromToken.price / toToken.price;
  return (
    <div className="flex items-center justify-between rounded-xl px-3 py-2 text-xs text-ink-secondary">
      <span className="flex items-center gap-1.5">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-ink-muted">
          <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1"/>
          <path d="M6 3.5 V6 L7.5 7" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
        </svg>
        Updated just now
      </span>
      <span className="tabular-nums text-ink-primary font-medium">
        1 {fromToken.symbol} ≈ {formatDisplayNumber(rate)} {toToken.symbol}
      </span>
    </div>
  );
}
