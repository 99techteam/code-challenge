import { formatAmount, formatUsd, parseAmount } from '../domain/amount.ts';
import { exchangeRate, quoteSwap } from '../domain/prices.ts';
import { validateSwap } from '../domain/validation.ts';
import type { PriceStatus, SwapViewModel } from './ports.ts';
import type { SwapState } from './state.ts';

const BADGE_LABELS: Record<PriceStatus, string> = {
  loading: 'Connecting',
  live: 'Live rates',
  cached: 'Cached rates',
};

// Pure projection of state into display-ready values, so views stay dumb.
export function toViewModel(state: SwapState): SwapViewModel {
  const { prices, from, to, amountIn, priceStatus, submitting } = state;
  const amount = parseAmount(amountIn);
  const rate = exchangeRate(prices.get(from), prices.get(to));
  const quote = amount === null ? null : quoteSwap(prices, from, to, amount);
  const { valid, error } = validateSwap({ from, to, amountIn, hasRate: rate !== null });

  return {
    from,
    to,
    amountIn,
    amountOut: quote ? formatAmount(quote.amountOut) : '',
    usdIn: '≈ ' + formatUsd(quote?.usdIn ?? 0),
    usdOut: '≈ ' + formatUsd(quote?.usdOut ?? 0),
    rate:
      rate === null
        ? null
        : { text: `1 ${from} = ${formatAmount(rate)} ${to}`, usd: `(${formatUsd(prices.get(from))})` },
    error,
    canSubmit: valid && !submitting,
    submitting,
    badge: { label: BADGE_LABELS[priceStatus], state: priceStatus },
  };
}
