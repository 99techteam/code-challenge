import { RefreshCwIcon, TriangleAlertIcon } from 'lucide-react';
import { useState } from 'react';

import { AmountField } from '@/components/AmountField';
import { RateSummary } from '@/components/RateSummary';
import { SwapButton } from '@/components/SwapButton';
import { Button } from '@/components/ui/button';
import { usePrices } from '@/hooks/usePrices';
import { useSwapAnimation } from '@/hooks/useSwapAnimation';
import { useSwapForm } from '@/hooks/useSwapForm';

/**
 * The converter.
 *
 * It owns the two things the screen needs — the price feed and the form state —
 * and hands each half of the card what it needs to render. Everything below it
 * is presentational.
 */
export function SwapCard() {
  const { tokens, status, error, refreshing, updatedAt, refresh } = usePrices();
  const form = useSwapForm(tokens);
  const animation = useSwapAnimation();
  const [refreshTurns, setRefreshTurns] = useState(0);

  const ready = status === 'ready';

  function handleRefresh() {
    setRefreshTurns((turns) => turns + 1);
    refresh();
  }

  function handleSwap() {
    // Measure before the swap, then let React apply both in one render so the
    // panels start offset and slide home instead of blinking.
    animation.play();
    form.swapSides();
  }

  return (
    <div className="w-[min(452px,100%)] rounded-3xl bg-card px-5 pt-5 pb-4.5 shadow-surface">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex flex-col gap-[3px]">
          <h1 className="text-xl leading-snug font-semibold tracking-[-0.02em]">
            Crypto converter
          </h1>
          <p className="text-xs text-muted-foreground">
            Convert any pair at the live mid-market rate.
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          aria-label="Refresh rates"
          disabled={refreshing}
          onClick={handleRefresh}
          className="size-8 shrink-0 rounded-full text-muted-foreground hover:text-foreground"
        >
          {/* One full turn per click is the immediate feedback; the "Updated"
              row below carries the slower truth about whether it worked. */}
          <RefreshCwIcon
            className="size-3.75"
            style={{
              transform: `rotate(${String(refreshTurns * 360)}deg)`,
              transition: 'transform 620ms var(--ease-spin)',
            }}
          />
        </Button>
      </div>

      <div className="flex flex-col gap-1.5">
        {/* The wrapper is what the swap button hangs off, so the button stays
            pinned to the seam while the panel itself slides during a swap. */}
        <div className="relative z-10">
          <AmountField
            ref={animation.fromRef}
            style={animation.fromStyle}
            side="from"
            label="From"
            value={form.fromValue}
            token={form.from}
            tokens={tokens}
            error={form.fromError}
            elevated={animation.moving}
            onValueChange={(raw) => {
              form.setAmount('from', raw);
            }}
            onFocus={() => {
              form.focusField('from');
            }}
            onBlur={form.blurField}
            onSelectToken={(code) => {
              form.selectToken('from', code);
            }}
          />

          <div className="absolute -bottom-[25px] left-1/2 z-40 -translate-x-1/2">
            <SwapButton turns={form.swapCount} disabled={!ready} onClick={handleSwap} />
          </div>
        </div>

        <AmountField
          ref={animation.toRef}
          style={animation.toStyle}
          className="relative z-0"
          side="to"
          label="To"
          value={form.toValue}
          token={form.to}
          tokens={tokens}
          error={form.toError}
          onValueChange={(raw) => {
            form.setAmount('to', raw);
          }}
          onFocus={() => {
            form.focusField('to');
          }}
          onBlur={form.blurField}
          onSelectToken={(code) => {
            form.selectToken('to', code);
          }}
        />
      </div>

      <RateSummary
        from={form.from}
        to={form.to}
        rate={form.rate}
        updatedAt={updatedAt}
        refreshing={refreshing}
      />

      {status === 'loading' ? (
        <p className="px-1 pt-1 text-xs text-muted-foreground">Loading prices…</p>
      ) : null}

      {error !== null && status !== 'loading' ? (
        <div
          role="alert"
          className="mt-2 flex items-center gap-2 rounded-lg bg-destructive/10 px-2.5 py-2 text-xs text-destructive"
        >
          <TriangleAlertIcon className="size-3.5 shrink-0" />
          {/* A refresh that fails over good prices is a warning, not a dead end:
              say what is on screen instead of implying nothing loaded. */}
          <span className="flex-1">
            {status === 'ready' ? `Could not refresh — ${error}. Showing the last prices.` : error}
          </span>
          <button
            type="button"
            onClick={handleRefresh}
            className="font-medium underline underline-offset-2"
          >
            Retry
          </button>
        </div>
      ) : null}
    </div>
  );
}
