import { applyDemoSwap } from '../../shared/balance.service.ts';
import type { SwapQuote } from '../../types/index.ts';

/** Simulates a short confirmation delay, then persists the demo balance changes. */
export async function executeDemoSwap(quote: SwapQuote): Promise<void> {
  await new Promise<void>((resolve) => window.setTimeout(resolve, 1050));
  applyDemoSwap(quote);
}
