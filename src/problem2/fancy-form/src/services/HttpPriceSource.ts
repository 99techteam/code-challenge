import type { PriceSnapshot, PriceSource } from '../app/ports.ts';
import { dedupePrices, isPriceRow } from '../domain/prices.ts';

// Fetches live USD prices from a JSON endpoint. Rejects on timeout, HTTP
// errors or an unusable payload so a fallback source can take over.
export class HttpPriceSource implements PriceSource {
  readonly #url: string;
  readonly #timeoutMs: number;

  constructor(url: string, timeoutMs = 8000) {
    this.#url = url;
    this.#timeoutMs = timeoutMs;
  }

  async load(): Promise<PriceSnapshot> {
    const response = await fetch(this.#url, { signal: AbortSignal.timeout(this.#timeoutMs) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const body: unknown = await response.json();
    if (!Array.isArray(body)) throw new Error('Unexpected price payload');

    const prices = dedupePrices(body.filter(isPriceRow));
    if (prices.size === 0) throw new Error('Price feed is empty');
    return { prices, origin: 'live' };
  }
}
