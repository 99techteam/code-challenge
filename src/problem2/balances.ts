// Mock wallet balance store.
//
// Initial balances come from `data/balances.json` so the demo starts in a
// realistic state. Tokens that aren't in the JSON fall back to a
// deterministic hash-derived balance, so every symbol in the live price
// feed still has something to spend.
//
// During the session the balances are mutated by `applySwap` (called from
// the swap form's submit handler). Reloading the page resets to the JSON
// snapshot — by design, since we deliberately don't touch localStorage to
// keep the demo reproducible.

import seedData from './data/balances.json';

const seed = seedData as Record<string, number>;

const hashSymbol = (symbol: string): number => {
  let h = 5381;
  for (let i = 0; i < symbol.length; i++) {
    h = ((h << 5) + h + symbol.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
};

// Fallback for symbols not listed in balances.json: spread across roughly
// four orders of magnitude so the UI shows a believable mix.
const fallbackBalance = (symbol: string): number => {
  const h = hashSymbol(symbol);
  const bucket = h % 4;
  const mantissa = 1 + ((h >> 4) % 9000) / 1000;
  const scales = [0.1, 1, 100, 10_000];
  return Number((mantissa * scales[bucket]).toFixed(4));
};

export const initialBalance = (symbol: string): number =>
  Object.prototype.hasOwnProperty.call(seed, symbol)
    ? seed[symbol]
    : fallbackBalance(symbol);

// Build the initial balance map for the given set of symbols.
export const loadInitialBalances = (
  symbols: string[],
): Record<string, number> => {
  const out: Record<string, number> = {};
  for (const s of symbols) out[s] = initialBalance(s);
  return out;
};

// Pure helper used by the view's swap handler: deduct `amountIn` from the
// FROM token and credit `amountOut` to the TO token. Returns a new map
// (immutable update) so React state updates trigger re-render.
export const applySwap = (
  balances: Record<string, number>,
  fromSymbol: string,
  amountIn: number,
  toSymbol: string,
  amountOut: number,
): Record<string, number> => ({
  ...balances,
  [fromSymbol]: Math.max(0, (balances[fromSymbol] ?? 0) - amountIn),
  [toSymbol]: (balances[toSymbol] ?? 0) + amountOut,
});
